import React, { useEffect, useRef } from 'react';

export default function Transcript({ transcript, isRecording, startRecording, stopRecording }) {
    const endOfTranscriptRef = useRef(null);

    useEffect(() => {
        endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="d-flex flex-column h-100 bg-white">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0 fw-bold">Meeting Transcript</h5>
                <button
                    className={`btn fw-bold ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? '⏹ Stop Mic' : '⏺ Start Mic'}
                </button>
            </div>

            <div className="flex-grow-1 p-3 overflow-auto">
                {transcript.length === 0 ? (
                    <div className="text-muted text-center mt-5">
                        <p>Your transcribed text will appear here.</p>
                        <small>Click "Start Mic" to begin.</small>
                    </div>
                ) : (
                    transcript.map((text, index) => (
                        <div key={index} className="mb-3">
                            <span className="badge bg-secondary mb-1">Chunk {index + 1}</span>
                            <p className="mb-0 lh-lg">{text}</p>
                        </div>
                    ))
                )}
                <div ref={endOfTranscriptRef} />
            </div>
        </div>
    );
}