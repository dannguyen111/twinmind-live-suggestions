import React, { useState } from 'react';

export default function WelcomeScreen({ onSaveKey }) {
    const [inputKey, setInputKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputKey.trim().startsWith('gsk_')) {
            onSaveKey(inputKey.trim());
        } else {
            alert("Please enter a valid Groq API key (usually starts with 'gsk_').");
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
            <div className="card shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-body p-5">
                    <h2 className="fw-bold mb-4 text-center">Welcome to TwinMind</h2>
                    <p className="text-muted mb-4 text-center">
                        To get started, please enter your Groq API key. This key is stored locally in your browser and is never saved to our servers.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="apiKey" className="form-label fw-bold">Groq API Key</label>
                            <input
                                type="password"
                                className="form-control"
                                id="apiKey"
                                placeholder="gsk_..."
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 fw-bold">
                            Launch Copilot
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <small className="text-muted">
                            Don't have a key? Get one for free at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com</a>.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}