import React from 'react';

interface SearchInfo {
    stages: string[];
    query: string;
    urls: string[];
    error?: string;
    documentRefs?: string[];
}

interface Message {
    id: number;
    content: string;
    isUser: boolean;
    type: string;
    isLoading?: boolean;
    searchInfo?: SearchInfo;
    documentRefs?: string[];
}

interface SearchStagesProps {
    searchInfo: SearchInfo;
}

interface DocumentRefsProps {
    docRefs: string[];
    getDocTitleById: (id: string) => string;
}

interface MessageAreaProps {
    messages: Message[];
    getDocTitleById: (id: string) => string;
}

const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center">
            <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "300ms" }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "600ms" }}></div>
            </div>
        </div>
    );
};

const SearchStages: React.FC<SearchStagesProps> = ({ searchInfo }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className="mb-3 mt-1 relative pl-4">
            <div className="flex flex-col space-y-3 text-sm text-zinc-300">
                {searchInfo.stages.includes('searching') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2 h-2 bg-white rounded-full"></div>
                        {searchInfo.stages.includes('reading') && (
                            <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+0.75rem)] bg-zinc-700"></div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium mb-2 ml-2">Searching the web</span>
                            <div className="flex flex-wrap gap-2 pl-2 mt-1">
                                <div className="bg-zinc-800 text-xs px-3 py-1.5 rounded-md border border-zinc-700 inline-flex items-center text-zinc-300">
                                    <svg className="w-3 h-3 mr-1.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    {searchInfo.query}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchInfo.stages.includes('reading') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2 h-2 bg-white rounded-full"></div>
                        <div className="flex flex-col">
                            <span className="font-medium mb-2 ml-2">Reading</span>
                            {searchInfo.urls && searchInfo.urls.length > 0 && (
                                <div className="pl-2 space-y-1">
                                    <div className="flex flex-wrap gap-2">
                                        {searchInfo.urls.map((url: string, index: number) => (
                                            <div key={index} className="bg-zinc-800 text-xs px-3 py-1.5 rounded-md border border-zinc-700 truncate max-w-[200px] text-zinc-400 hover:text-zinc-300 transition-colors">
                                                {url}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {searchInfo.stages.includes('writing') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2 h-2 bg-white rounded-full"></div>
                        <span className="font-medium pl-2">Writing answer</span>
                    </div>
                )}

                {searchInfo.stages.includes('error') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">Search error</span>
                        <div className="pl-4 text-xs text-red-400 mt-1">
                            {searchInfo.error || "An error occurred during search."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Component to display document references
const DocumentRefs: React.FC<DocumentRefsProps> = ({ docRefs, getDocTitleById }) => {
    if (!docRefs || docRefs.length === 0) return null;

    return (
        <div className="mt-3 pt-3 border-t border-zinc-700">
            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Sources</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {docRefs.map((docId: string, index: number) => (
                    <span 
                        key={index} 
                        className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md border border-zinc-700"
                    >
                        <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {getDocTitleById(docId)}
                    </span>
                ))}
            </div>
        </div>
    );
};

const MessageArea: React.FC<MessageAreaProps> = ({ messages, getDocTitleById }) => {
    return (
        <div className="flex-grow overflow-y-auto bg-black" style={{ minHeight: 0 }}>
            <div className="max-w-3xl mx-auto p-6">
                {messages.map((message: Message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className="flex flex-col max-w-[85%]">
                            {!message.isUser && message.searchInfo && (
                                <SearchStages searchInfo={message.searchInfo} />
                            )}

                            <div
                                className={`rounded-2xl py-3 px-4 ${message.isUser
                                    ? 'bg-white text-black'
                                    : 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                                    }`}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : (
                                    <>
                                        <div className="whitespace-pre-wrap">{message.content || (
                                            <span className="text-zinc-500 text-sm">Waiting for response...</span>
                                        )}</div>
                                        {!message.isUser && message.documentRefs && message.documentRefs.length > 0 && (
                                            <DocumentRefs docRefs={message.documentRefs} getDocTitleById={getDocTitleById} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageArea;