import React, { useState } from 'react';
import Transcript from './components/Transcript';
import Suggestions from './components/Suggestions';
import Chat from './components/Chat';
import axios from 'axios';

function App() {
  const [transcript, setTranscript] = useState([]);
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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
    handleChatRequest(`Tell me more about this suggestion: "${suggestion.preview}"`);
  };

  const handleManualRefresh = () => {
    console.log("Manual refresh triggered");
    // TODO: Force the audio hook to flush its chunk early
  };

  const handleChatRequest = async (query) => {
    const tempApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!tempApiKey) return;

    const newUserMessage = { role: 'user', content: query };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        query: query,
        transcript: transcript.join('\n'),
        history: chatMessages,
        apiKey: tempApiKey
      });

      const aiResponse = { role: 'assistant', content: response.data.answer };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error fetching the detailed answer." }]);
    } finally {
      setIsChatLoading(false);
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

        {/* Middle Column: Live Suggestions */}
        <div className="col-4 h-100 p-0">
          <Suggestions
            batches={suggestionBatches}
            onSuggestionClick={handleSuggestionClick}
            onRefresh={handleManualRefresh}
          />
        </div>

        {/* Right Column: Chat */}
        <div className="col-4 h-100 p-0 border-start">
          <Chat
            messages={chatMessages}
            onSendMessage={handleChatRequest}
            isLoading={isChatLoading}
          />
        </div>

      </div>
    </div>
  );
}

export default App;