import React, { useState } from 'react';
import Transcript from './components/Transcript';
import Suggestions from './components/Suggestions';
import axios from 'axios';

function App() {
  const [transcript, setTranscript] = useState([]);
  const [suggestionBatches, setSuggestionBatches] = useState([]);

  // TODO: Change the function name and implementation to send the 30s audio chunk to Django backend.
  const handleAudioChunk = async (audioBlob) => {
    // Hardcoded API key for testing - replace with secure method in production
    const tempApiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!tempApiKey) {
      alert("Please enter a Groq API key in the code to test.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("apiKey", tempApiKey);
    formData.append("context", transcript.join('\n'));

    try {
      // Send the chunk to our new Django endpoint
      const response = await axios.post('http://localhost:8000/api/process-audio/', formData);

      const newText = response.data.transcript;
      const newSuggestions = response.data.suggestions;

      if (newText) {
        setTranscript((prev) => [...prev, newText]);
      }

      if (newSuggestions && newSuggestions.length > 0) {
        setSuggestionBatches((prevBatches) => [newSuggestions, ...prevBatches]);
      }

    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    console.log("Card clicked!", suggestion);
    // TODO: Send this to the Chat column and fetch the detailed answer
  };

  const handleManualRefresh = () => {
    console.log("Manual refresh triggered");
    // TODO: Force the audio hook to flush its chunk early
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

        {/* Middle Column: Live Suggestions */}
        <div className="col-4 h-100 p-0">
          <Suggestions
            batches={suggestionBatches}
            onSuggestionClick={handleSuggestionClick}
            onRefresh={handleManualRefresh}
          />
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