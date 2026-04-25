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
        <div className="d-flex flex-column h-100 bg-white">
            <div className="p-3 border-bottom">
                <h5 className="mb-0 fw-bold">Chat</h5>
            </div>

            <div className="flex-grow-1 p-3 overflow-auto bg-light">
                {messages.length === 0 ? (
                    <div className="text-muted text-center mt-5">
                        <p>Click a suggestion or type a question to get more details.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`mb-3 d-flex flex-column ${msg.role === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                            <div
                                className={`p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border markdown-container'}`}
                                style={{ maxWidth: '90%' }}
                            >
                                {msg.role === 'user' ? (
                                    <p className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="mb-3 d-flex flex-column align-items-start">
                        <div className="p-2 rounded-3 shadow-sm bg-white border text-muted">
                            <small>Thinking...</small>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-top">
                <form onSubmit={handleSubmit} className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Ask TwinMind..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}