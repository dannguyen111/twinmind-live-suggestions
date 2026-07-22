import React from 'react';

const getBadgeColor = (type) => {
    const safeType = type?.toLowerCase() || '';
    if (safeType.includes('question')) return 'tm-badge-question';
    if (safeType.includes('talking point')) return 'tm-badge-talking-point';
    if (safeType.includes('answer')) return 'tm-badge-answer';
    if (safeType.includes('fact-check')) return 'tm-badge-fact-check';
    if (safeType.includes('clarification')) return 'tm-badge-clarification';
    return 'tm-badge-default';
};

export default function Suggestions({ batches, onSuggestionClick, onRefresh, isRefreshing }) {
    return (
        <>
            {/* Header with Loading Refresh Button */}
            <div className="tm-panel-header">
                <h5>Live Suggestions</h5>
                <button
                    className="tm-icon-btn tm-icon-btn-light"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label={isRefreshing ? 'Refreshing suggestions' : 'Refresh suggestions'}
                    data-tooltip={isRefreshing ? 'Refreshing…' : 'Refresh suggestions'}
                >
                    <svg
                        className={isRefreshing ? 'tm-spin' : ''}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
            </div>

            {/* Scrollable Suggestions Area */}
            <div className="tm-panel-body">
                {batches.length === 0 ? (
                    <div className="tm-empty-state">
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
                                        className="tm-suggestion-card"
                                        style={{ opacity: baseOpacity }}
                                        onClick={() => onSuggestionClick(suggestion)}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = baseOpacity; }}
                                    >
                                        <span className={`tm-badge ${getBadgeColor(suggestion.type)}`}>
                                            {suggestion.type}
                                        </span>
                                        <p>{suggestion.preview}</p>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}