interface InputBarProps {
    currentMessage: string;
    setCurrentMessage: (message: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onToggleContext: () => void;
    hasContext: boolean;
    activeDocsCount?: number;
}

const InputBar: React.FC<InputBarProps> = ({ 
    currentMessage, 
    setCurrentMessage, 
    onSubmit, 
    onToggleContext,
    hasContext,
    activeDocsCount = 0
}) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value)
    }

    return (
        <form onSubmit={onSubmit} className="bg-black border-b border-zinc-800 rounded-2xl  flex-shrink-0">
            <div className="p-4">
                <div className="flex items-center bg-zinc-900 rounded-2xl p-3 border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleContext();
                        }}
                        className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                            hasContext 
                                ? 'text-white bg-zinc-800' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                        title={hasContext ? `${activeDocsCount} document${activeDocsCount > 1 ? 's' : ''} active` : "Add documents for RAG"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {activeDocsCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-medium rounded-full flex items-center justify-center">
                                {activeDocsCount}
                            </span>
                        )}
                    </button>
                    
                    <input
                        type="text"
                        placeholder={hasContext ? `Ask about your ${activeDocsCount} document${activeDocsCount > 1 ? 's' : ''}...` : "Ask anything..."}
                        value={currentMessage}
                        onChange={handleChange}
                        className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-white placeholder-zinc-500"
                    />
                    
                    <button
                        type="submit"
                        disabled={!currentMessage.trim()}
                        className="bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-xl p-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
               
            </div>
        </form>
    )
}

export default InputBar