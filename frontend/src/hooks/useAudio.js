import { useState, useRef, useCallback } from 'react';

export default function useAudio(onChunkReady) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    const startRecording = useCallback(async () => {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            // Handle the chunks as they are generated
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && onChunkReady) {
                    // event.data is a Blob containing the audio for that timeslice
                    onChunkReady(event.data);
                }
            };

            // Start recording and emit a chunk exactly every 30 secs.
            mediaRecorder.start(30000);
            setIsRecording(true);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access is required to use this feature.");
        }
    }, [onChunkReady]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            // fire with whatever audio is left
            mediaRecorderRef.current.stop();

            // Stop the actual microphone tracks to turn off the browser's red recording dot
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    }, [isRecording]);

    return { isRecording, startRecording, stopRecording };
}