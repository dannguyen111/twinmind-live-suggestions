import React from 'react';

export default function Suggestions({ batches, onSuggestionClick, onRefresh }) {
    return (
        <div className="d-flex flex-column h-100 bg-white border-end">
            {/* Header with Manual Refresh Button */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Live Suggestions</h5>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onRefresh}
                    title="Manually force a new batch of suggestions"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Scrollable Suggestions Area */}
            <div className="flex-grow-1 p-3 overflow-auto bg-light">
                {batches.length === 0 ? (
                    <div className="text-muted text-center mt-5">
                        <p>Suggestions will appear here.</p>
                        <small>Start talking to generate insights.</small>
                    </div>
                ) : (
                    batches.map((batch, batchIndex) => (
                        <div key={batchIndex} className="mb-4">
                            {/* Optional: Label the batch so it's clear what arrived together */}
                            <div className="text-muted small fw-bold mb-2 text-uppercase">
                                {batchIndex === 0 ? '✨ Newest Suggestions' : `Previous Batch`}
                            </div>

                            {batch.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    className="card mb-2 shadow-sm border-0"
                                    style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    onMouseEnter={(e) => e.currentTarget.classList.add('border-primary')}
                                    onMouseLeave={(e) => e.currentTarget.classList.remove('border-primary')}
                                >
                                    <div className="card-body p-3">
                                        <span className="badge bg-primary text-uppercase mb-2">
                                            {suggestion.type}
                                        </span>
                                        <p className="mb-0 text-dark">
                                            {suggestion.preview}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}