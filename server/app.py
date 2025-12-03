from typing import TypedDict, Annotated, Optional, List
from langgraph.graph import add_messages, StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage, SystemMessage
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()

# Initialize memory saver for checkpointing
memory = MemorySaver()

class Document(TypedDict):
    id: str
    title: str
    content: str

class State(TypedDict):
    messages: Annotated[list, add_messages]
    documents: Optional[List[Document]]

search_tool = TavilySearchResults(
    max_results=4,
)

tools = [search_tool]

# Configure Groq API using OpenAI compatibility
llm = ChatOpenAI(
    model="llama-3.1-8b-instant",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

llm_with_tools = llm.bind_tools(tools=tools)

def create_rag_system_message(documents: List[Document]) -> SystemMessage:
    """Create a system message for RAG with the provided documents."""
    docs_text = "\n\n".join([
        f"=== Document: {doc['title']} (ID: {doc['id']}) ===\n{doc['content']}"
        for doc in documents
    ])
    
    doc_titles = ", ".join([f"'{doc['title']}'" for doc in documents])
    
    return SystemMessage(content=f"""You are a helpful assistant with access to a knowledge base containing the following documents: {doc_titles}.

<knowledge_base>
{docs_text}
</knowledge_base>

Instructions:
1. Use the provided documents to answer the user's questions accurately.
2. IMPORTANT: When you use information from a document, you MUST mention which document you're referencing by its title.
3. Start your response by indicating which document(s) you're using, e.g., "Based on [Document Title]..." or "According to [Document Title]..."
4. If the answer can be found in the documents, provide it with relevant details and cite the source document.
5. If the documents don't contain enough information to fully answer the question, say so clearly.
6. You can still use web search if the user asks about something not covered in the documents or if they explicitly ask you to search the web.
7. Always prioritize information from the provided documents over general knowledge when relevant.""")

async def model(state: State):
    messages = state["messages"]
    documents = state.get("documents")
    
    # If documents are provided and no system message exists, add one
    if documents and len(documents) > 0 and not any(isinstance(m, SystemMessage) for m in messages):
        messages = [create_rag_system_message(documents)] + messages
    
    result = await llm_with_tools.ainvoke(messages)
    return {
        "messages": [result], 
    }

async def tools_router(state: State):
    last_message = state["messages"][-1]

    if(hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0):
        return "tool_node"
    else: 
        return END
    
async def tool_node(state):
    """Custom tool node that handles tool calls from the LLM."""
    # Get the tool calls from the last message
    tool_calls = state["messages"][-1].tool_calls
    
    # Initialize list to store tool messages
    tool_messages = []
    
    # Process each tool call
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]
        
        # Handle the search tool
        if tool_name == "tavily_search_results_json":
            # Execute the search tool with the provided arguments
            search_results = await search_tool.ainvoke(tool_args)
            
            # Create a ToolMessage for this result
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            
            tool_messages.append(tool_message)
    
    # Add the tool messages to the state
    return {"messages": tool_messages}

graph_builder = StateGraph(State)

graph_builder.add_node("model", model)
graph_builder.add_node("tool_node", tool_node)
graph_builder.set_entry_point("model")

graph_builder.add_conditional_edges("model", tools_router)
graph_builder.add_edge("tool_node", "model")

graph = graph_builder.compile(checkpointer=memory)

app = FastAPI()

# Add CORS middleware with settings that match frontend requirements
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
    expose_headers=["Content-Type"], 
)

def serialise_ai_message_chunk(chunk): 
    if(isinstance(chunk, AIMessageChunk)):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation"
        )

async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None, documents: Optional[str] = None):
    try:
        is_new_conversation = checkpoint_id is None
        
        # Parse documents if provided
        parsed_documents = None
        if documents:
            try:
                parsed_documents = json.loads(documents)
            except json.JSONDecodeError:
                parsed_documents = None
        
        # Prepare initial state with documents if provided
        initial_state = {"messages": [HumanMessage(content=message)]}
        if parsed_documents:
            initial_state["documents"] = parsed_documents
        
        if is_new_conversation:
            # Generate new checkpoint ID for first message in conversation
            new_checkpoint_id = str(uuid4())

            config = {
                "configurable": {
                    "thread_id": new_checkpoint_id
                }
            }
            
            # Initialize with first message
            events = graph.astream_events(
                initial_state,
                version="v2",
                config=config
            )
            
            # First send the checkpoint ID
            yield f"data: {{\"type\": \"checkpoint\", \"checkpoint_id\": \"{new_checkpoint_id}\"}}\n\n"
        else:
            config = {
                "configurable": {
                    "thread_id": checkpoint_id
                }
            }
            # Continue existing conversation
            events = graph.astream_events(
                initial_state,
                version="v2",
                config=config
            )

        # Collect full AI response to detect document references at the end
        full_ai_response = ""
        
        async for event in events:
            event_type = event["event"]
            
            if event_type == "on_chat_model_stream":
                chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
                full_ai_response += chunk_content
                # Escape single quotes and newlines for safe JSON parsing
                safe_content = chunk_content.replace("'", "\\'").replace("\n", "\\n")
                
                yield f"data: {{\"type\": \"content\", \"content\": \"{safe_content}\"}}\n\n"
                
            elif event_type == "on_chat_model_end":
                # Check if there are tool calls for search
                tool_calls = event["data"]["output"].tool_calls if hasattr(event["data"]["output"], "tool_calls") else []
                search_calls = [call for call in tool_calls if call["name"] == "tavily_search_results_json"]
                
                if search_calls:
                    # Signal that a search is starting
                    search_query = search_calls[0]["args"].get("query", "")
                    # Escape quotes and special characters
                    safe_query = search_query.replace('"', '\\"').replace("'", "\\'").replace("\n", "\\n")
                    yield f"data: {{\"type\": \"search_start\", \"query\": \"{safe_query}\"}}\n\n"
                    
            elif event_type == "on_tool_end" and event["name"] == "tavily_search_results_json":
                # Search completed - send results or error
                output = event["data"]["output"]
                
                # Check if output is a list 
                if isinstance(output, list):
                    # Extract URLs from list of search results
                    urls = []
                    for item in output:
                        if isinstance(item, dict) and "url" in item:
                            urls.append(item["url"])
                    
                    # Convert URLs to JSON and yield them
                    urls_json = json.dumps(urls)
                    yield f"data: {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"
        
        # After all events, detect which documents were actually referenced in the response
        if parsed_documents and full_ai_response:
            referenced_doc_ids = []
            # Check if any document title appears in the AI response
            for doc in parsed_documents:
                if doc["title"].lower() in full_ai_response.lower():
                    referenced_doc_ids.append(doc["id"])
            
            # Send document refs only if documents were actually referenced
            if referenced_doc_ids:
                doc_ids_json = json.dumps(referenced_doc_ids)
                yield f"data: {{\"type\": \"document_refs\", \"documents\": {doc_ids_json}}}\n\n"
        
        # Send an end event
        yield f"data: {{\"type\": \"end\"}}\n\n"
    
    except Exception as e:
        error_message = str(e)
        
        # Check for rate limit error
        if "429" in error_message or "rate_limit" in error_message.lower():
            error_response = "Rate limit reached on Groq API. Please wait a few minutes or upgrade your plan at https://console.groq.com/settings/billing"
        elif "api key" in error_message.lower() or "authentication" in error_message.lower():
            error_response = "API authentication error. Please check your API keys in the .env file"
        else:
            error_response = f"Error: {error_message[:100]}"
        
        # Escape the error message for JSON
        safe_error = error_response.replace('"', '\\"').replace("\n", "\\n")
        yield f"data: {{\"type\": \"error\", \"message\": \"{safe_error}\"}}\n\n"
        yield f"data: {{\"type\": \"end\"}}\n\n"

@app.get("/chat_stream/{message}")
async def chat_stream(
    message: str, 
    checkpoint_id: Optional[str] = Query(None),
    documents: Optional[str] = Query(None)
):
    return StreamingResponse(
        generate_chat_responses(message, checkpoint_id, documents), 
        media_type="text/event-stream"
    )

# SSE - server-sent events 