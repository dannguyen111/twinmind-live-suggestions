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
                    className={`tm-btn-pill ${isRecording ? 'tm-btn-pill-danger' : 'tm-btn-pill-dark'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? '⏹ Stop Mic' : '⏺ Start Mic'}
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