import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Chat.css';

export default function Chat({ messages, onSendMessage, isLoading }) {
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <>
            <div className="tm-panel-header">
                <h5>Chat</h5>
            </div>

            <div className="tm-panel-body">
                {messages.length === 0 ? (
                    <div className="tm-empty-state">
                        <p>Click a suggestion or type a question to get more details.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`tm-msg-row ${msg.role === 'user' ? 'tm-msg-user' : 'tm-msg-assistant'}`}>
                            {msg.role === 'user' ? (
                                <div className="tm-bubble-user">
                                    <p>{msg.content}</p>
                                </div>
                            ) : (
                                <div className="tm-bubble-assistant markdown-container">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {msg.role === 'user' && <div className="tm-avatar">U</div>}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="tm-msg-row tm-msg-assistant">
                        <span className="tm-thinking">Thinking...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="tm-input-bar">
                <form onSubmit={handleSubmit} className="tm-input-pill">
                    <input
                        type="text"
                        className="tm-input"
                        placeholder="Ask TwinMind..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="tm-send-btn" disabled={isLoading || !input.trim()} aria-label="Send message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 11.5L21 3L12.5 21L10.5 13.5L3 11.5Z" fill="currentColor" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
}