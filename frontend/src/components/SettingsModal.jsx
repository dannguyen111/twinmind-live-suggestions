import React, { useState } from 'react';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
    const [formData, setFormData] = useState(settings);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = e.target.type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.suggestionContextLimit > 40000 || formData.chatContextLimit > 40000) {
            alert("Context limits cannot exceed 40,000 characters to prevent model payload errors.");
            return;
        }
        if (formData.chatHistoryLimit > 30) {
            alert("Chat history cannot exceed 30 messages to preserve context window.");
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title fw-bold">⚙️ Copilot Settings</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body bg-light">
                        <form id="settingsForm" onSubmit={handleSubmit}>

                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Live Suggestions</h6>
                            <div className="mb-3">
                                <label className="form-label fw-bold small">System Prompt</label>
                                <textarea
                                    className="form-control font-monospace small"
                                    rows="6"
                                    name="suggestionPrompt"
                                    value={formData.suggestionPrompt}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small">Transcript Context Limit (Characters)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="suggestionContextLimit"
                                    value={formData.suggestionContextLimit}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="form-text">~15,000 characters is roughly 3,000 tokens.</div>
                            </div>

                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Chat & Detailed Answers</h6>
                            <div className="mb-3">
                                <label className="form-label fw-bold small">System Prompt</label>
                                <textarea
                                    className="form-control font-monospace small"
                                    rows="4"
                                    name="chatPrompt"
                                    value={formData.chatPrompt}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="row mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-bold small">Transcript Context Limit (Chars)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="chatContextLimit"
                                        value={formData.chatContextLimit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-bold small">Chat History Limit (Messages)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="chatHistoryLimit"
                                        value={formData.chatHistoryLimit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" form="settingsForm" className="btn btn-primary fw-bold">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}