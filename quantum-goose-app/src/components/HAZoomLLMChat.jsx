import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import LLMService from '../services/llmService';
import './MaxHazoomChat.css';

const HAZoomLLMChat = ({ sidebarCollapsed: externalCollapsed = false }) => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(externalCollapsed);
  const [systemInfo, setSystemInfo] = useState(null);
  const [accelerationInfo, setAccelerationInfo] = useState(null);
  const [intelligenceLevel, setIntelligenceLevel] = useState('super');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [availableModels, setAvailableModels] = useState([]);
  const [currentModel, setCurrentModel] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentResponseRef = useRef('');

  useEffect(() => {
    setSidebarCollapsed(externalCollapsed);
  }, [externalCollapsed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize - fetch system info and check health
    initializeBackend();
    fetchAvailableModels();
    
    // Check for model parameter in URL
    const modelParam = searchParams.get('model');
    if (modelParam) {
      // Set model from URL parameter after models are loaded
      setTimeout(() => {
        selectModel(modelParam);
      }, 1000);
    }
  }, [searchParams]);

  const initializeBackend = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Check backend health
      const health = await LLMService.healthCheck();
      console.log('Backend health:', health);
      
      // Fetch system info
      const sysInfo = await LLMService.getSystemInfo();
      setSystemInfo(sysInfo);
      
      // Fetch acceleration info
      const accelInfo = await LLMService.getAccelerationInfo();
      setAccelerationInfo(accelInfo);
      
      setConnectionStatus('connected');
      
      // Add welcome message with system info
      addSystemMessage(formatWelcomeMessage(health, sysInfo, accelInfo));
      
    } catch (error) {
      console.error('Failed to initialize backend:', error);
      setConnectionStatus('error');
      addSystemMessage('⚠️ Failed to connect to LLM backend. Using offline mode.');
    }
  };

  const fetchAvailableModels = async () => {
    try {
      setLoadingModels(true);
      
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/');
        const data = await response.json();
        
        if (data.status === 'success') {
          setAvailableModels(data.models || []);
          setCurrentModel(data.current_model || '');
          return;
        }
      } catch (djangoError) {
        console.log('Django models API failed, trying direct Ollama:', djangoError.message);
      }
      
      // Fallback to direct Ollama API
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');
        const ollamaData = await ollamaResponse.json();
        
        if (ollamaData.models) {
          const formattedModels = ollamaData.models.map(model => ({
            name: model.name,
            size: model.size,
            digest: model.digest,
            modified_at: model.modified_at,
            details: model.details,
            is_current: model.name === currentModel
          }));
          
          setAvailableModels(formattedModels);
          
          if (!currentModel && formattedModels.length > 0) {
            setCurrentModel(formattedModels[0].name);
          }
        }
      } catch (ollamaError) {
        console.error('Failed to fetch models:', ollamaError);
      }
      
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const selectModel = async (modelName) => {
    try {
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/legacy/set/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: modelName }),
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setCurrentModel(modelName);
          setShowModelPicker(false);
          addSystemMessage(`✅ Model switched to **${modelName}**. Ready for interaction!`);
          fetchAvailableModels(); // Refresh model list
          return;
        }
      } catch (djangoError) {
        console.log('Django set model failed, using local state:', djangoError.message);
      }
      
      // Fallback to local state update
      setCurrentModel(modelName);
      setShowModelPicker(false);
      addSystemMessage(`✅ Model switched to **${modelName}**. Ready for interaction!`);
      
    } catch (error) {
      console.error('Error setting model:', error);
      addSystemMessage(`❌ Failed to switch to ${modelName}: ${error.message}`);
    }
  };

  const formatWelcomeMessage = (health, sysInfo, accelInfo) => {
    const cpu = sysInfo?.system_info?.cpu || {};
    const gpu = sysInfo?.system_info?.gpu || {};
    const memory = sysInfo?.system_info?.memory || {};
    
    return `🚀 **HAZoom Super Intelligence Activated!**
 
${health.message}
 
**System Configuration:**
• CPU: ${cpu.processor || 'Unknown'} (${cpu.cores_logical || 0} cores)
• GPU: ${gpu.gpus?.length > 0 ? gpu.gpus[0].name : 'CPU-only mode'}
• Memory: ${memory.total_gb || 0} GB RAM
• Acceleration: ${accelInfo?.current_backend?.toUpperCase() || 'CPU'}
• Intelligence Level: **${intelligenceLevel.toUpperCase()}**
• Current Model: **${currentModel || 'None'}**
 
I'm ready to help you with super intelligence for peace and optimization! 🌊
 
Try asking me about:
• System specs and acceleration
• Optimization recommendations  
• Quantum consciousness and AI
• Any technical or creative challenge
• Switch models with the model picker above
 
What can I help you with today?`;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use a more aggressive scroll approach for full chat windows
      const scrollContainer = messagesEndRef.current.closest('.chat-messages');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      
      // Also use the smooth scroll as fallback
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
          });
        }
      }, 100);
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

    // Add empty AI message that will be filled with streaming response
    const aiMsg = addMessage('', 'ai');
    currentResponseRef.current = '';

    try {
      if (connectionStatus === 'connected') {
        // Use real LLM backend with streaming
        await LLMService.sendMessageStreaming(
          userMessage,
          // onToken
          (token) => {
            currentResponseRef.current += token;
            updateLastMessage(currentResponseRef.current);
          },
          // onComplete
          (fullResponse) => {
            setIsTyping(false);
            currentResponseRef.current = '';
          },
          // onError
          (error) => {
            console.error('Streaming error:', error);
            updateLastMessage(`❌ Error: ${error}`);
            setIsTyping(false);
            currentResponseRef.current = '';
          }
        );
      } else {
        // Fallback to offline mode
        const response = generateOfflineResponse(userMessage);
        await simulateTyping(response, (text) => {
          updateLastMessage(text);
        });
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateLastMessage(`❌ Error: ${error.message}`);
      setIsTyping(false);
    }
  };

  const simulateTyping = async (text, onUpdate) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (const word of words) {
      currentText += word + ' ';
      onUpdate(currentText);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const generateOfflineResponse = (userMessage) => {
    return `⚠️ **Offline Mode**\n\nI'm currently running in offline mode. To use full LLM capabilities, ensure the Django backend is running.\n\nYour message: "${userMessage}"`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (text) => {
    setInputMessage(text);
    inputRef.current?.focus();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const clearChat = async () => {
    if (window.confirm('Clear chat history? This will reset the conversation on the backend too.')) {
      try {
        if (connectionStatus === 'connected') {
          await LLMService.clearHistory();
        }
        setMessages([]);
        addSystemMessage('✓ Chat history cleared. Ready for a fresh start!');
      } catch (error) {
        console.error('Failed to clear history:', error);
        addSystemMessage('⚠️ Failed to clear backend history, but local history cleared.');
      }
    }
  };

  const handleIntelligenceLevelChange = async (level) => {
    try {
      if (connectionStatus === 'connected') {
        await LLMService.setIntelligenceLevel(level);
      }
      setIntelligenceLevel(level);
      addSystemMessage(`✓ Intelligence level set to: **${level.toUpperCase()}**`);
    } catch (error) {
      console.error('Failed to set intelligence level:', error);
      addSystemMessage(`⚠️ Failed to change intelligence level: ${error.message}`);
    }
  };

  const showSystemInfo = async () => {
    try {
      const info = await LLMService.getSystemInfo();
      const accel = await LLMService.getAccelerationInfo();
      
      const message = formatSystemInfo(info, accel);
      addSystemMessage(message);
    } catch (error) {
      addSystemMessage(`⚠️ Failed to fetch system info: ${error.message}`);
    }
  };

  const formatSystemInfo = (info, accel) => {
    const cpu = info?.system_info?.cpu || {};
    const gpu = info?.system_info?.gpu || {};
    const memory = info?.system_info?.memory || {};
    
    let msg = `🖥️ **SYSTEM INFORMATION**\n\n`;
    msg += `**CPU:**\n`;
    msg += `• ${cpu.processor || 'Unknown'}\n`;
    msg += `• ${cpu.cores_physical || 0} physical cores, ${cpu.cores_logical || 0} logical cores\n`;
    msg += `• Usage: ${cpu.cpu_percent || 0}%\n\n`;
    
    msg += `**GPU:**\n`;
    if (gpu.gpus && gpu.gpus.length > 0) {
      gpu.gpus.forEach((g, i) => {
        msg += `• GPU ${i+1}: ${g.name}\n`;
        if (g.memory) msg += `  Memory: ${g.memory}\n`;
      });
    } else {
      msg += `• No dedicated GPU detected\n`;
    }
    msg += `\n`;
    
    msg += `**Memory:**\n`;
    msg += `• Total: ${memory.total_gb || 0} GB\n`;
    msg += `• Available: ${memory.available_gb || 0} GB\n`;
    msg += `• Usage: ${memory.percent || 0}%\n\n`;
    
    msg += `**AI Acceleration:**\n`;
    msg += `• Backend: ${accel?.current_backend?.toUpperCase() || 'CPU'}\n`;
    msg += `• Intelligence Level: ${intelligenceLevel.toUpperCase()}\n`;
    
    return msg;
  };

  const quickActions = [
    "Tell me about your system configuration",
    "What acceleration is available?",
    "Show me optimization recommendations",
    "Help me with quantum consciousness"
  ];

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#fbbf24';
      case 'error': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="app-container">
      <div className="toggle-nav-container">
        <button className="toggle-nav-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="nav-state-indicator">
          Navigation <span>{sidebarCollapsed ? 'hidden' : 'visible'}</span>
        </div>
      </div>

      <div className={`navigator-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <div className="nav-title">🚀 HAZoom LLM</div>
          <div className="nav-subtitle">Super Intelligence System</div>
          <div className="status-indicator">
            <div className="status-dot" style={{ backgroundColor: getStatusColor() }}></div>
            <span>{connectionStatus === 'connected' ? 'Online' : connectionStatus}</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">🧠 Intelligence Level</div>
          {['nano', 'standard', 'super', 'quantum'].map(level => (
            <div 
              key={level}
              className={`nav-item ${intelligenceLevel === level ? 'active' : ''}`}
              onClick={() => handleIntelligenceLevelChange(level)}
            >
              <span className="nav-item-icon">
                {level === 'nano' ? '⚡' : level === 'standard' ? '🎯' : level === 'super' ? '🧠' : '🌊'}
              </span>
              <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">🤖 AI Model Selection</div>
          <div className="model-selector">
            <div 
              className="current-model-display"
              onClick={() => setShowModelPicker(!showModelPicker)}
            >
              <span className="model-icon">🧠</span>
              <div className="model-info">
                <span className="model-name">
                  {currentModel || 'No Model Selected'}
                </span>
                <span className="model-count">
                  {availableModels.length} models available
                </span>
              </div>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showModelPicker && (
              <div className="model-dropdown">
                <div className="dropdown-header">
                  <h4>Choose AI Model</h4>
                  <button 
                    className="refresh-models-btn"
                    onClick={() => {
                      fetchAvailableModels();
                      setShowModelPicker(false);
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {loadingModels ? (
                  <div className="loading-models">
                    <span>⏳ Loading models...</span>
                  </div>
                ) : (
                  <div className="model-list">
                    {availableModels.length === 0 ? (
                      <div className="no-models">
                        <span>⚠️ No models available</span>
                        <button 
                          onClick={() => window.location.href = '/models'}
                          className="manage-models-btn"
                        >
                          Manage Models
                        </button>
                      </div>
                    ) : (
                      availableModels.map((model) => (
                        <div
                          key={model.name}
                          className={`model-option ${model.name === currentModel ? 'current' : ''}`}
                          onClick={() => selectModel(model.name)}
                        >
                          <div className="model-option-info">
                            <span className="model-option-name">{model.name}</span>
                            <div className="model-option-details">
                              <span className="model-size">
                                {model.details?.parameter_size || 'Unknown'}
                              </span>
                              <span className="model-family">
                                {model.details?.family || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          {model.name === currentModel && (
                            <span className="current-indicator">✓</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                <div className="dropdown-footer">
                  <button 
                    onClick={() => window.location.href = '/models'}
                    className="manage-models-btn"
                  >
                    ⚙️ Manage Models
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">🎯 Quick Actions</div>
          <div className="nav-item" onClick={showSystemInfo}>
            <span className="nav-item-icon">🖥️</span>
            <span>System Info</span>
          </div>
          <div className="nav-item" onClick={() => handleQuickAction('Show me acceleration options')}>
            <span className="nav-item-icon">⚡</span>
            <span>Acceleration</span>
          </div>
          <div className="nav-item" onClick={() => handleQuickAction('Help me optimize for peace')}>
            <span className="nav-item-icon">🌍</span>
            <span>Peace Mode</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">⚙️ Settings</div>
          <div className="nav-item" onClick={clearChat}>
            <span className="nav-item-icon">🗑️</span>
            <span>Clear Chat</span>
          </div>
          <div className="nav-item" onClick={initializeBackend}>
            <span className="nav-item-icon">🔄</span>
            <span>Reconnect</span>
          </div>
        </div>
      </div>

      <div className={`chat-container ${sidebarCollapsed ? 'full-width' : ''}`}>
        <div className="chat-header">
          <h1>🪿 HAZoom Super Intelligence</h1>
          <p>Automated LLM with GPU/CPU acceleration for peace</p>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'user' ? 'U' : message.sender === 'system' ? 'S' : 'H'}
              </div>
              <div className="message-content">
                <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <div className="message-timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">H</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span>HAZoom is thinking with {intelligenceLevel} intelligence</span>
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

        <div className="chat-input-container">
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                className="quick-action-btn" 
                onClick={() => handleQuickAction(action)}
              >
                {action.split(',')[0].substring(0, 30)}...
              </button>
            ))}
          </div>
          
          <div className="chat-input-wrapper">
            <textarea 
              ref={inputRef}
              className="chat-input" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask HAZoom anything... (Enter to send, Shift+Enter for new line)"
              rows="1"
            />
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HAZoomLLMChat;
