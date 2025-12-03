"use client"

import React, { useState } from 'react';

interface Document {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}

interface DocumentManagerProps {
    documents: Document[];
    setDocuments: (docs: Document[]) => void;
    activeDocIds: string[];
    setActiveDocIds: (ids: string[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
    documents,
    setDocuments,
    activeDocIds,
    setActiveDocIds,
    isOpen,
    onClose
}) => {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAddDocument = () => {
        if (newTitle.trim() && newContent.trim()) {
            const newDoc: Document = {
                id: `doc_${Date.now()}`,
                title: newTitle.trim(),
                content: newContent.trim(),
                createdAt: new Date()
            };
            setDocuments([...documents, newDoc]);
            setActiveDocIds([...activeDocIds, newDoc.id]);
            setNewTitle("");
            setNewContent("");
            setIsAddingNew(false);
        }
    };

    const handleDeleteDocument = (docId: string) => {
        setDocuments(documents.filter(d => d.id !== docId));
        setActiveDocIds(activeDocIds.filter(id => id !== docId));
    };

    const handleToggleActive = (docId: string) => {
        if (activeDocIds.includes(docId)) {
            setActiveDocIds(activeDocIds.filter(id => id !== docId));
        } else {
            setActiveDocIds([...activeDocIds, docId]);
        }
    };

    const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="border-t border-zinc-800 bg-zinc-950 max-h-[40vh] overflow-auto flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-medium text-white">Knowledge Base</span>
                    {documents.length > 0 && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-xl border border-zinc-700">
                            {activeDocIds.length}/{documents.length} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isAddingNew && (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="text-sm text-zinc-400 hover:text-white px-3 py-1 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1 border border-zinc-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Document
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Add New Document Form */}
                {isAddingNew && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-white">New Document</span>
                            <button
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setNewTitle("");
                                    setNewContent("");
                                }}
                                className="text-zinc-500 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Document title"
                            className="w-full px-3 py-2 text-sm bg-black border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 mb-3 text-white placeholder-zinc-500"
                        />
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Paste your document content here..."
                            className="w-full h-32 px-3 py-2 text-sm bg-black border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 resize-none text-white placeholder-zinc-500"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-zinc-500">
                                {getWordCount(newContent)} words
                            </span>
                            <button
                                onClick={handleAddDocument}
                                disabled={!newTitle.trim() || !newContent.trim()}
                                className="px-4 py-2 bg-white text-black text-sm rounded-xl hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                            >
                                Add to Knowledge Base
                            </button>
                        </div>
                    </div>
                )}

                {/* Document List */}
                {documents.length === 0 && !isAddingNew ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-zinc-400 text-sm">No documents added yet</p>
                        <p className="text-zinc-600 text-xs mt-1">Add documents to use as context for your questions</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className={`bg-zinc-900 rounded-2xl border transition-colors ${
                                    activeDocIds.includes(doc.id) 
                                        ? 'border-zinc-600' 
                                        : 'border-zinc-800'
                                }`}
                            >
                                <div className="flex items-center p-3">
                                    <button
                                        onClick={() => handleToggleActive(doc.id)}
                                        className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                                            activeDocIds.includes(doc.id)
                                                ? 'bg-white border-white'
                                                : 'border-zinc-600 hover:border-zinc-400'
                                        }`}
                                    >
                                        {activeDocIds.includes(doc.id) && (
                                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="font-medium text-white truncate">{doc.title}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-0.5 ml-6">
                                            {getWordCount(doc.content)} words · Added {doc.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                                            title="Preview"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {expandedDocId === doc.id && (
                                    <div className="px-3 pb-3">
                                        <div className="bg-black rounded-xl p-3 text-sm text-zinc-400 max-h-40 overflow-y-auto border border-zinc-800">
                                            {doc.content.substring(0, 500)}
                                            {doc.content.length > 500 && '...'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            {documents.length > 0 && (
                <div className="p-3 bg-black border-t border-zinc-800 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Selected documents will be used as context. The AI will reference which document it uses.
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
