import React, { useRef, useEffect } from 'react';
import useAudio from '../hooks/useAudio';

export default function Transcript({ transcript, onAudioChunk }) {
    const { isRecording, startRecording, stopRecording } = useAudio(onAudioChunk);

    // Auto-scroll behavior
    const transcriptEndRef = useRef(null);
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="d-flex flex-column h-100 bg-white border-end">
            {/* Header with Mic Button */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Transcript</h5>
                <button
                    className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? '⏹ Stop Mic' : '⏺ Start Mic'}
                </button>
            </div>

            {/* Scrollable Transcript Area */}
            <div className="flex-grow-1 p-3 overflow-auto">
                {transcript.length === 0 ? (
                    <div className="text-muted text-center mt-5">
                        <p>Ready to record.</p>
                        <small>Click 'Start Mic' to begin. The transcript will append in ~30-second chunks.</small>
                    </div>
                ) : (
                    transcript.map((line, index) => (
                        <div key={index} className="mb-3">
                            <span className="badge bg-light text-dark border mb-1">
                                {/* Optional: Add a simple timestamp or chunk label here if desired */}
                                Chunk {index + 1}
                            </span>
                            <p className="mb-0 text-dark lh-base">{line}</p>
                        </div>
                    ))
                )}
                {/* Empty div acting as the anchor for auto-scrolling */}
                <div ref={transcriptEndRef} />
            </div>
        </div>
    );
}