import { useState, useRef, useCallback } from 'react';

export default function useAudio(onChunkReady) {
    const [isRecording, setIsRecording] = useState(false);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const cycleTimeoutRef = useRef(null);

    const startRecordingCycle = useCallback(() => {
        if (!streamRef.current) return;

        // Create a fresh MediaRecorder instance for this specific chunk
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && onChunkReady) {
                onChunkReady(event.data);
            }
        };

        mediaRecorder.start();

        // Exactly 30 seconds later, stop this recording and immediately start the next cycle
        cycleTimeoutRef.current = setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                startRecordingCycle();
            }
        }, 30000);

    }, [onChunkReady]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setIsRecording(true);

            // Kick off the 30-second loop
            startRecordingCycle();

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access is required to use this feature.");
        }
    }, [startRecordingCycle]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        clearTimeout(cycleTimeoutRef.current);

        // Stop the current active recorder to capture the final partial chunk
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // Kill the microphone tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    return { isRecording, startRecording, stopRecording };
}