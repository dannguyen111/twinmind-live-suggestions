import React, { useState } from 'react';
import Transcript from './components/Transcript';
import axios from 'axios';

function App() {
  const [transcript, setTranscript] = useState([]);

  // TODO: Change the function name and implementation to send the 30s audio chunk to Django backend.
  const handleAudioChunk = async (audioBlob) => {
    // Hardcoded API key for testing - replace with secure method in production
    const tempApiKey = "";

    if (!tempApiKey) {
      alert("Please enter a Groq API key in the code to test.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("apiKey", tempApiKey);

    try {
      // Send the chunk to our new Django endpoint
      const response = await axios.post('http://localhost:8000/api/process-audio/', formData);

      const newText = response.data.transcript;
      if (newText) {
        setTranscript((prev) => [...prev, newText]);
      }
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden bg-light">
      {/* Navbar / Header */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
        <span className="navbar-brand mb-0 h1 fw-bold">TwinMind Copilot</span>
        {/* We'll add the Export button here later */}
      </nav>

      {/* Main 3-Column Layout */}
      <div className="row g-0 h-100 pb-5">

        {/* Left Column: Mic & Transcript */}
        <div className="col-4 h-100">
          <Transcript
            transcript={transcript}
            onAudioChunk={handleAudioChunk}
          />
        </div>

        {/* Middle Column: Live Suggestions (Placeholder) */}
        <div className="col-4 h-100 bg-white border-end p-3 overflow-auto">
          <h5 className="fw-bold border-bottom pb-3 mb-3">Live Suggestions</h5>
          <div className="text-muted text-center mt-5">
            <p>Suggestions will appear here.</p>
          </div>
        </div>

        {/* Right Column: Chat (Placeholder) */}
        <div className="col-4 h-100 bg-white p-3 overflow-auto">
          <h5 className="fw-bold border-bottom pb-3 mb-3">Chat</h5>
          <div className="text-muted text-center mt-5">
            <p>Click a suggestion to see details.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;