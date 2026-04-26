import React, { useState, useEffect } from 'react';
import Transcript from './components/Transcript';
import Suggestions from './components/Suggestions';
import Chat from './components/Chat';
import WelcomeScreen from './components/WelcomeScreen';
import useAudio from './hooks/useAudio';
import axios from 'axios';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [transcript, setTranscript] = useState([]);
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAudioChunk = async (audioBlob) => {
    // Hardcoded API key for testing - replace with secure method in production
    if (!apiKey) return;

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("apiKey", apiKey);
    formData.append("context", transcript.join('\n'));

    setIsProcessing(true);

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
    } finally {
      setIsProcessing(false);
    }
  };

  const { isRecording, startRecording, stopRecording, forceRefresh } = useAudio(handleAudioChunk);

  const handleSuggestionClick = (suggestion) => {
    handleChatRequest(`Tell me more about this suggestion: "${suggestion.preview}"`);
  };

  const handleManualRefresh = () => {
    console.log("Manual refresh triggered");
    // TODO: Force the audio hook to flush its chunk early
  };

  const handleSaveKey = (key) => {
    localStorage.setItem('groqApiKey', key);
    setApiKey(key);
  };

  const handleClearKey = () => {
    localStorage.removeItem('groqApiKey');
    setApiKey('');
    // Potentially reset app state to clear the screen on logout
  };

  const handleChatRequest = async (query) => {
    if (!apiKey) return;

    const newUserMessage = { role: 'user', content: query };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        query: query,
        transcript: transcript.join('\n'),
        history: chatMessages,
        apiKey: apiKey
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

  if (!apiKey) {
    return <WelcomeScreen onSaveKey={handleSaveKey} />;
  }

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden bg-light d-flex flex-column">
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1 fw-bold">TwinMind Copilot</span>
        <button className="btn btn-sm btn-outline-light" onClick={handleClearKey}>
          Clear API Key
        </button>
      </nav>

      {/* Main 3-Column Layout */}
      <div className="row g-0 flex-grow-1 overflow-hidden">

        {/* Left Column: Mic & Transcript */}
        <div className="col-4 h-100">
          <Transcript
            transcript={transcript}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        </div>

        {/* Middle Column: Live Suggestions */}
        <div className="col-4 h-100 p-0 border-start">
          <Suggestions
            batches={suggestionBatches}
            onSuggestionClick={handleSuggestionClick}
            onRefresh={forceRefresh}
            isRefreshing={isProcessing}
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