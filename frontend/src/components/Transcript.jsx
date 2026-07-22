import React, { useEffect, useRef } from 'react';

export default function Transcript({ transcript, isRecording, startRecording, stopRecording }) {
    const endOfTranscriptRef = useRef(null);

    useEffect(() => {
        endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <>
            <div className="tm-panel-header">
                <h5>Meeting Transcript</h5>
                <button
                    className={`tm-icon-btn ${isRecording ? 'tm-icon-btn-danger tm-mic-recording' : 'tm-icon-btn-dark'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    data-tooltip={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    )}
                </button>
            </div>

            <div className="tm-panel-body">
                {transcript.length === 0 ? (
                    <div className="tm-empty-state">
                        <p>Your transcribed text will appear here.</p>
                        <small>Click "Start Mic" to begin.</small>
                    </div>
                ) : (
                    transcript.map((text, index) => (
                        <div key={index} className="mb-3">
                            <span className="tm-chip mb-1 d-inline-block">Chunk {index + 1}</span>
                            <p className="mb-0 lh-lg">{text}</p>
                        </div>
                    ))
                )}
                <div ref={endOfTranscriptRef} />
            </div>
        </>
    );
}