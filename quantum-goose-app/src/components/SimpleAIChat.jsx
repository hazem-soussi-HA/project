import React, { useState, useEffect, useRef } from 'react';
import LLMService from '../services/llmService';
import './SimpleAIChat.css';

const SimpleAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedModel, setSelectedModel] = useState('llama2:latest');
  const [availableModels, setAvailableModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Check backend health
      const health = await LLMService.healthCheck();
      console.log('Backend health:', health);
      
      // Get available models
      const modelsData = await LLMService.getAvailableModels();
      const models = modelsData.models || [];
      setAvailableModels(models);
      
      // Set default model if available
      if (models.length > 0) {
        const defaultModel = models.find(m => m.name === 'llama2:latest') || models[0];
        setSelectedModel(defaultModel.name);
        await LLMService.setModel(defaultModel.name);
      }
      
      setConnectionStatus('connected');
      
      // Add welcome message
      addSystemMessage(`🤖 **AI Assistant Ready!**

I'm powered by ${selectedModel} and ready to help you with any questions or tasks.

**How can I assist you today?**
• Answer questions and provide information
• Help with problem-solving
• Assist with writing and editing
• Provide explanations and tutorials
• Creative brainstorming

Just type your message below and press Enter to start chatting!`);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionStatus('error');
      addSystemMessage('⚠️ **Connection Issue**\n\nUnable to connect to the AI service. Please check if the backend server is running and refresh the page.');
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addMessage = (text, sender, metadata = null) => {
    const msg = {
      id: Date.now() + Math.random(),
      text: text,
      sender: sender,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      metadata
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const addSystemMessage = (text) => {
    addMessage(text, 'system');
  };

  const updateLastMessage = (text) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1].text = text;
      }
      return newMessages;
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // Add user message
    addMessage(userMessage, 'user');

    // Add empty AI message for streaming
    addMessage('', 'ai');

    try {
      if (connectionStatus === 'connected') {
        let fullResponse = '';
        
        // Use streaming response
        await LLMService.sendMessageStreaming(
          userMessage,
          // onToken
          (token) => {
            fullResponse += token;
            updateLastMessage(fullResponse);
          },
          // onComplete
          () => {
            setIsTyping(false);
          },
          // onError
          (error) => {
            console.error('Streaming error:', error);
            updateLastMessage(`❌ **Error**: ${error}`);
            setIsTyping(false);
          }
        );
      } else {
        // Fallback response
        const response = generateOfflineResponse(userMessage);
        simulateTyping(response);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateLastMessage(`❌ **Error**: ${error.message}`);
      setIsTyping(false);
    }
  };

  const simulateTyping = async (text) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (const word of words) {
      currentText += word + ' ';
      updateLastMessage(currentText);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  const generateOfflineResponse = (userMessage) => {
    return `⚠️ **Offline Mode**

I'm currently running in offline mode. To use full AI capabilities, please ensure the backend server is running.

Your message: "${userMessage}"

Please refresh the page or contact support if the issue persists.`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = async (modelName) => {
    try {
      setSelectedModel(modelName);
      setShowModelSelector(false);
      
      await LLMService.setModel(modelName);
      addSystemMessage(`✅ **Model Changed**\n\nNow using: ${modelName}\n\nHow can I help you with this AI model?`);
    } catch (error) {
      addSystemMessage(`❌ **Model Change Failed**\n\nCould not switch to ${modelName}. Please try again.`);
    }
  };

  const clearChat = async () => {
    if (window.confirm('Clear all messages and start a new conversation?')) {
      try {
        await LLMService.clearHistory();
        setMessages([]);
        addSystemMessage('✅ **Chat Cleared**\n\nReady for a fresh conversation! What would you like to discuss?');
      } catch (error) {
        setMessages([]);
        addSystemMessage('✅ **Chat Cleared**\n\nReady for a fresh conversation! What would you like to discuss?');
      }
    }
  };

  const reconnect = async () => {
    setMessages([]);
    await initializeChat();
  };

  const formatMessageText = (text) => {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="simple-chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1>🤖 AI Assistant</h1>
          <div className="connection-status">
            <div 
              className="status-dot" 
              style={{ backgroundColor: getStatusColor() }}
            ></div>
            <span>{getStatusText()}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="model-selector">
            <button 
              className="model-button"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              🧠 {selectedModel.split(':')[0]}
              <span className="model-arrow">▼</span>
            </button>
            
            {showModelSelector && (
              <div className="model-dropdown">
                {availableModels.map((model) => (
                  <div
                    key={model.name}
                    className={`model-option ${selectedModel === model.name ? 'selected' : ''}`}
                    onClick={() => handleModelChange(model.name)}
                  >
                    <div className="model-name">{model.name}</div>
                    <div className="model-size">
                      {model.size ? `${(model.size / (1024**3)).toFixed(1)} GB` : 'Cloud'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="header-btn" onClick={clearChat} title="Clear Chat">
            🗑️
          </button>
          
          <button className="header-btn" onClick={reconnect} title="Reconnect">
            🔄
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-avatar">
              {message.sender === 'user' ? '👤' : message.sender === 'system' ? 'ℹ️' : '🤖'}
            </div>
            <div className="message-content">
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
              />
              <div className="message-time">{message.timestamp}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span>AI is thinking</span>
                <div className="typing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea 
            ref={inputRef}
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
            rows="1"
            disabled={isTyping || connectionStatus !== 'connected'}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || connectionStatus !== 'connected'}
          >
            {isTyping ? '⏳' : '➤'}
          </button>
        </div>
        
        <div className="input-footer">
          <span className="footer-text">
            Powered by {selectedModel} • {messages.length} messages
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleAIChat;