import React from 'react';

const getBadgeColor = (type) => {
    const safeType = type?.toLowerCase() || '';
    if (safeType.includes('question')) return 'bg-success';
    if (safeType.includes('talking point')) return 'bg-info text-dark';
    if (safeType.includes('answer')) return 'bg-warning text-dark';
    if (safeType.includes('fact-check')) return 'bg-danger';
    if (safeType.includes('clarification')) return 'bg-secondary';
    return 'bg-primary';
};

export default function Suggestions({ batches, onSuggestionClick, onRefresh, isRefreshing }) {
    return (
        <div className="d-flex flex-column h-100 bg-white border-end">
            {/* Header with Loading Refresh Button */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Live Suggestions</h5>
                <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Manually force a new batch of suggestions"
                >
                    {isRefreshing ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Refreshing...
                        </>
                    ) : (
                        <>🔄 Refresh</>
                    )}
                </button>
            </div>

            {/* Scrollable Suggestions Area */}
            <div className="flex-grow-1 p-3 overflow-auto bg-secondary bg-opacity-10">
                {batches.length === 0 ? (
                    <div className="text-muted text-center mt-5">
                        <p>Suggestions will appear here.</p>
                        <small>Start talking to generate insights.</small>
                    </div>
                ) : (
                    batches.map((batch, batchIndex) => {
                        const baseOpacity = batchIndex === 0 ? 1 : Math.max(1 - (batchIndex * 0.3), 0.5);

                        return (
                            <div key={batchIndex} className="mb-4">
                                <div
                                    className="text-muted small fw-bold mb-2 text-uppercase"
                                    style={{ opacity: baseOpacity }}
                                >
                                    {batchIndex === 0
                                        ? `✨ Newest Suggestions (Chunk ${batches.length - batchIndex})`
                                        : `Chunk ${batches.length - batchIndex} Suggestions`
                                    }
                                </div>

                                {batch.map((suggestion, idx) => (
                                    <div
                                        key={idx}
                                        className="card mb-3 shadow border"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease-in-out',
                                            opacity: baseOpacity
                                        }}
                                        onClick={() => onSuggestionClick(suggestion)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.classList.add('border-primary', 'shadow');
                                            e.currentTarget.classList.remove('shadow-sm', 'border-0');
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.classList.remove('border-primary');
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.opacity = baseOpacity;
                                        }}
                                    >
                                        <div className="card-body p-3">
                                            <span className={`badge ${getBadgeColor(suggestion.type)} text-uppercase mb-2`}>
                                                {suggestion.type}
                                            </span>
                                            <p className="mb-0 text-dark">
                                                {suggestion.preview}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}