import React, { useState, useEffect } from 'react';
import Transcript from './components/Transcript';
import Suggestions from './components/Suggestions';
import Chat from './components/Chat';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import useAudio from './hooks/useAudio';
import axios from 'axios';

const DEFAULT_SETTINGS = {
  suggestionPrompt: `You are TwinMind, an elite AI meeting copilot. 
Your goal is to listen to the live transcript of a meeting and provide exactly 3 highly contextual, instantly useful suggestions to the user.
They can be: Question to ask, Talking point, Answer, Fact-check, or Clarification.
RULES: Provide exactly 3 suggestions. The "preview" must be short (max 12 words). Output ONLY valid JSON in the exact format requested.
JSON FORMAT: { "suggestions": [ { "type": "fact-check", "preview": "Groq's LPU is faster than standard GPUs." } ] }`,

  chatPrompt: `You are TwinMind, an elite AI meeting copilot.
You answer questions based on the live meeting transcript and previous chat history.

RESPONSE RULES:
1. IF the user's prompt starts with "Tell me more about this suggestion:" -> Provide a comprehensive, detailed deep-dive. Use markdown, tables, and bullet points to break down the context, importance, and actionable next steps.
2. IF the user types any other follow-up question -> Keep your answer more CONCISE (200 words max). At the very end, ask a relevant follow-up question to see if they want to go deeper into the specifics.`,

  suggestionContextLimit: 40000,
  chatContextLimit: 40000,
  chatHistoryLimit: 50
};

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('twinMindSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [transcript, setTranscript] = useState([]);
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleAudioChunk = async (audioBlob) => {
    // Hardcoded API key for testing - replace with secure method in production
    if (!apiKey) return;

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("apiKey", apiKey);
    formData.append("context", transcript.join('\n'));
    formData.append("suggestionPrompt", settings.suggestionPrompt);
    formData.append("suggestionContextLimit", settings.suggestionContextLimit);

    setIsProcessing(true);

    try {
      // Send the chunk to our new Django endpoint
      const response = await axios.post(`${API_BASE_URL}/api/process-audio/`, formData);

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

  const handleExport = () => {
    const timestamp = new Date().toLocaleString();
    let exportText = `TwinMind Copilot - Session Export\nGenerated: ${timestamp}\n`;
    exportText += `====================================================\n\n`;

    exportText += `### MEETING TRANSCRIPT ###\n\n`;
    if (transcript.length === 0) exportText += `(No transcript recorded)\n`;
    transcript.forEach((text, index) => {
      exportText += `[Chunk ${index + 1}]\n${text}\n\n`;
    });

    exportText += `====================================================\n\n`;

    exportText += `### LIVE SUGGESTIONS ###\n\n`;
    if (suggestionBatches.length === 0) exportText += `(No suggestions generated)\n`;

    [...suggestionBatches].reverse().forEach((batch, index) => {
      exportText += `[Chunk ${index + 1} Insights]\n`;
      batch.forEach(sug => {
        exportText += `- [${sug.type.toUpperCase()}] ${sug.preview}\n`;
      });
      exportText += `\n`;
    });

    exportText += `====================================================\n\n`;

    exportText += `### CHAT HISTORY ###\n\n`;
    if (chatMessages.length === 0) exportText += `(No chat history)\n`;
    chatMessages.forEach((msg) => {
      const roleName = msg.role === 'user' ? 'You' : 'TwinMind';
      exportText += `[${roleName}]:\n${msg.content}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `TwinMind_Session_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      const response = await axios.post(`${API_BASE_URL}/api/chat/`, {
        query: query,
        transcript: transcript.join('\n'),
        history: chatMessages,
        apiKey: apiKey,
        chatPrompt: settings.chatPrompt,
        chatContextLimit: settings.chatContextLimit,
        chatHistoryLimit: settings.chatHistoryLimit
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

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('twinMindSettings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  if (!apiKey) {
    return <WelcomeScreen onSaveKey={handleSaveKey} />;
  }

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden bg-light d-flex flex-column">
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1 fw-bold">TwinMind Copilot</span>
        <div className="d-flex gap-3">
          <button className="btn btn-sm btn-outline-light fw-bold" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Settings
          </button>
          <button className="btn btn-sm btn-success fw-bold shadow-sm" onClick={handleExport}>
            💾 Export Session
          </button>
          <button className="btn btn-sm btn-outline-light" onClick={handleClearKey}>
            Clear API Key
          </button>
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

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