import React, { useState, useEffect } from 'react';
import Transcript from './components/Transcript';
import Suggestions from './components/Suggestions';
import Chat from './components/Chat';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import useAudio from './hooks/useAudio';
import axios from 'axios';
import './App.css';

const DEFAULT_SETTINGS = {
  suggestionPrompt: `You are TwinMind, an elite AI meeting copilot. 
Your goal is to analyze the live meeting transcript and provide exactly 3 highly contextual, instantly useful suggestions. 

CRITICAL - CONTEXTUAL DECISION MAKING:
You must dynamically choose the type of suggestions based on the CURRENT flow of the meeting. Read the room:
- IF an unanswered question was just asked in the transcript -> Provide an "Answer".
- IF a bold claim, statistic, or assumption was just made -> Provide a "Fact-check".
- IF a complex, vague, or technical topic was introduced -> Provide a "Clarification".
- IF the conversation is stalling, summarizing, or needs direction -> Provide a "Question" or "Talking point".

Provide the RIGHT mix of these 5 types at the RIGHT time. Never provide 3 of the same type unless the context absolutely demands it.

RULES: 
1. Provide exactly 3 suggestions. 
2. The "preview" must be highly actionable and short (max 12 words). 
3. Output ONLY valid JSON.
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
    <div className="tm-app-shell">
      <header className="tm-header">
        <span className="tm-header-title">
          <span className="tm-logo-dot">TM</span>
          TwinMind Copilot
        </span>
        <div className="tm-header-actions">
          <button
            className="tm-icon-btn tm-icon-btn-light"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            data-tooltip="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button
            className="tm-icon-btn tm-icon-btn-accent"
            onClick={handleExport}
            aria-label="Export session"
            data-tooltip="Export session"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button
            className="tm-icon-btn tm-icon-btn-light"
            onClick={handleClearKey}
            aria-label="Clear API key"
            data-tooltip="Clear API key"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Main 3-Column Layout */}
      <div className="tm-panel-wrap">

        {/* Left Column: Mic & Transcript */}
        <div className="tm-panel">
          <Transcript
            transcript={transcript}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        </div>

        {/* Middle Column: Live Suggestions */}
        <div className="tm-panel">
          <Suggestions
            batches={suggestionBatches}
            onSuggestionClick={handleSuggestionClick}
            onRefresh={forceRefresh}
            isRefreshing={isProcessing}
          />
        </div>

        {/* Right Column: Chat */}
        <div className="tm-panel">
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