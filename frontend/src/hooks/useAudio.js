import { useState, useRef, useCallback } from 'react';

export default function useAudio(onChunkReady) {
    const [isRecording, setIsRecording] = useState(false);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const cycleTimeoutRef = useRef(null);

    const startRecordingCycle = useCallback(() => {
        if (!streamRef.current) return;

        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && onChunkReady) {
                onChunkReady(event.data);
            }
        };

        mediaRecorder.start();

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

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const forceRefresh = useCallback(() => {
        if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            clearTimeout(cycleTimeoutRef.current);
            mediaRecorderRef.current.stop();
            startRecordingCycle();
        }
    }, [isRecording, startRecordingCycle]);

    return { isRecording, startRecording, stopRecording, forceRefresh };
}