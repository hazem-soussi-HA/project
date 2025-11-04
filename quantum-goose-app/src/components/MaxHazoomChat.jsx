import React, { useState, useEffect, useRef } from 'react';
import './MaxHazoomChat.css';

const MaxHazoomChat = ({ sidebarCollapsed: externalCollapsed = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(externalCollapsed);
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with external sidebarCollapsed prop
  useEffect(() => {
    setSidebarCollapsed(externalCollapsed);
  }, [externalCollapsed]);

  const quickActions = [
    "Hello, how can you help me?",
    "What can you do?",
    "Help me get started",
    "Show me available tools"
  ];

  useEffect(() => {
    scrollToBottom();
    loadChatHistory();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('max-hazoom-chat-history');
      if (saved) {
        const history = JSON.parse(saved);
        setMessages(history.filter(msg => msg.sender !== undefined));
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
    }
  };

  const saveChatHistory = () => {
    try {
      localStorage.setItem('max-hazoom-chat-history', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  };

  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  const simulateAIResponse = async (userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = [
      "Hello! I'm Goose, your AI assistant. I'm here to help you with a wide variety of tasks including coding, data analysis, content creation, and much more. What would you like to work on today?",
      
      "That's a great question! I can help you with programming, data visualization, file processing, web scraping, automation, and many other technical tasks. Could you tell me more about what you're trying to accomplish?",
      
      "I have access to various tools and extensions that allow me to help you with complex tasks. I can read and write files, process data, create visualizations, interact with websites, manage your system, and much more. What specific task can I assist you with?",
      
      "I'd be happy to help you with that! As Goose AI, I'm designed to be a versatile assistant that can handle everything from simple questions to complex multi-step projects. Could you provide more details about what you need?",
      
      "That's an interesting challenge! I can help you approach this systematically. Let me ask a few questions to better understand your needs, and then we can work together to find the best solution.",
      
      "I understand what you're looking for. Based on my capabilities, I can assist you through various approaches. Would you prefer a step-by-step guide, or would you like me to handle this automatically using the available tools?",
      
      "Great question! I have extensive knowledge across many domains and can help you learn new concepts, solve problems, or create content. What specific aspect would you like to explore further?",
      
      "I can definitely help you with that! I have access to developer tools, data processing capabilities, visualization functions, and many other resources. Let me know what you'd like to accomplish and I'll guide you through the process.",
      
      "That's within my capabilities! I can help you with everything from simple queries to complex technical projects. What would you like to start with?",
      
      "Excellent! I love helping with creative and technical challenges. Let me know what you have in mind and I'll help you bring your ideas to life using the tools and knowledge available to me."
    ];

    // More contextual responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm Goose, your AI assistant powered by the Max-Hazoom Navigator system. I'm here to help you with any task you have in mind. What would you like to work on today?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I'm Goose, a versatile AI assistant with access to powerful tools! I can help you with:\n\n🔧 **Technical Tasks**: Coding, data analysis, file processing, web scraping\n📊 **Visualizations**: Charts, graphs, maps, and interactive data displays\n🗂️ **File Management**: Read, write, edit various file formats (docs, PDFs, spreadsheets)\n🌐 **Web Interaction**: Browse websites, interact with APIs, extract information\n💻 **System Operations**: Shell commands, automation, desktop control\n🧠 **Memory & Learning**: Remember preferences, save information for future reference\n\nWhat specific task would you like help with?";
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
      return "I'd be happy to help you with programming! I can assist with:\n\n• **Code Analysis**: Review and understand existing codebases\n• **Bug Fixing**: Identify and solve programming issues\n• **Feature Development**: Build new functionality\n• **Code Review**: Best practices and optimization suggestions\n• **Multiple Languages**: Python, JavaScript, Shell, and more\n\nWhat programming challenge are you working on? Feel free to share your code or describe the problem!";
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('analy')) {
      return "Data analysis is one of my specialties! I can help you with:\n\n📈 **Data Processing**: Clean, transform, and analyze datasets\n📊 **Visualizations**: Create charts, graphs, and interactive displays\n🔍 **Pattern Recognition**: Identify trends and insights in your data\n📋 **Report Generation**: Summarize findings and create comprehensive reports\n\nWhat kind of data are you working with, and what insights are you looking to discover?";
    }
    
    if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
      return "I love creative projects! I can help you create:\n\n• **Web Applications**: Interactive websites and web apps\n• **Documents**: Reports, presentations, and documentation\n• **Visual Content**: Charts, diagrams, and infographics\n• **Automation Scripts**: Tools to streamline your workflow\n• **Data Processing Pipelines**: Automated data workflows\n\nWhat would you like to create? Describe your vision and I'll help bring it to life!";
    }

    // Return a random general response
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await simulateAIResponse(userMessage);
      
      const aiMsg = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem('max-hazoom-chat-history');
    }
  };

  const exportChat = () => {
    const chatData = {
      exported: new Date().toISOString(),
      history: messages
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `max-hazoom-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const activateNavSection = (section) => {
    // This would handle different navigation sections
    switch(section) {
      case 'tools':
        addMessage("🛠️ **Available Tools & Extensions:**\n\n• **Developer Tools**: Code editing, shell commands, file management\n• **Data Processing**: Excel, PDF, DOCX manipulation\n• **Visualization**: Charts, maps, interactive displays\n• **Web Scraping**: Fetch and process web content\n• **Memory System**: Save and retrieve information across sessions\n• **Computer Control**: System automation and desktop interaction\n\nAll these tools are automatically available to help with your tasks!", 'ai');
        break;
      case 'projects':
        addMessage("📁 **Project Management:**\n\nI can help you organize and manage your projects! I can:\n\n• Create project structures and documentation\n• Analyze existing codebases and provide insights\n• Set up development environments\n• Track progress and manage tasks\n• Integrate with various tools and services\n\nWhat type of project are you working on, or would you like to start a new one?", 'ai');
        break;
      case 'memories':
        addMessage("🧠 **Memory System:**\n\nI have a sophisticated memory system that allows me to remember:\n\n• Your preferences and settings\n• Project-specific configurations\n• Important information across sessions\n• Workflow habits and patterns\n\nYou can save important information for later retrieval, and I'll remember it for our future conversations! This makes our collaboration more efficient over time.\n\nIs there anything specific you'd like me to remember for future reference?", 'ai');
        break;
      default:
        break;
    }
  };

  const addMessage = (text, sender) => {
    const newMsg = {
      id: Date.now(),
      text: text,
      sender: sender,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const insertQuickText = (text) => {
    setInputMessage(text);
    inputRef.current?.focus();
  };

  return (
    <div className="app-container">
      {/* Toggle Navigator Container */}
      <div className="toggle-nav-container">
        <button className="toggle-nav-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="nav-state-indicator">
          Navigation <span>{sidebarCollapsed ? 'hidden' : 'visible'}</span>
        </div>
      </div>

      {/* Navigator Sidebar */}
      <div className={`navigator-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <div className="nav-title">🚀 Max-Hazoom</div>
          <div className="nav-subtitle">AI Navigator System</div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">🗂️ Navigation</div>
          <div className="nav-item active" data-section="chat">
            <span className="nav-item-icon">💬</span>
            <span>Chat with Goose</span>
          </div>
          <div className="nav-item" data-section="projects" onClick={() => activateNavSection('projects')}>
            <span className="nav-item-icon">📁</span>
            <span>Projects</span>
          </div>
          <div className="nav-item" data-section="tools" onClick={() => activateNavSection('tools')}>
            <span className="nav-item-icon">🔧</span>
            <span>Available Tools</span>
          </div>
          <div className="nav-item" data-section="memories" onClick={() => activateNavSection('memories')}>
            <span className="nav-item-icon">🧠</span>
            <span>Memories</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">🎯 Quick Actions</div>
          <div className="nav-item" onClick={() => insertQuickText('Help me with coding')}>
            <span className="nav-item-icon">💻</span>
            <span>Code Help</span>
          </div>
          <div className="nav-item" onClick={() => insertQuickText('Explain something to me')}>
            <span className="nav-item-icon">📚</span>
            <span>Learn & Explain</span>
          </div>
          <div className="nav-item" onClick={() => insertQuickText('Help me analyze data')}>
            <span className="nav-item-icon">📊</span>
            <span>Data Analysis</span>
          </div>
          <div className="nav-item" onClick={() => insertQuickText('Create something for me')}>
            <span className="nav-item-icon">✨</span>
            <span>Create & Build</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">⚙️ Settings</div>
          <div className="nav-item" onClick={clearChat}>
            <span className="nav-item-icon">🗑️</span>
            <span>Clear Chat</span>
          </div>
          <div className="nav-item" onClick={exportChat}>
            <span className="nav-item-icon">💾</span>
            <span>Export Chat</span>
          </div>
          <div className="nav-item" onClick={toggleTheme}>
            <span className="nav-item-icon">🌙</span>
            <span>Toggle Theme</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-container ${sidebarCollapsed ? 'full-width' : ''}`}>
        <div className="chat-header">
          <h1>🪿 Goose AI Assistant</h1>
          <p>Your intelligent companion powered by Max-Hazoom Navigator</p>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">🚀</div>
              <div className="welcome-title">Welcome to Max-Hazoom Navigator!</div>
              <div className="welcome-subtitle">
                I'm Goose, your AI assistant. Start chatting by typing a message below, 
                or use the quick actions in the navigator sidebar.
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? 'U' : 'G'}
                </div>
                <div className="message-content">
                  <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }} />
                  <div className="message-timestamp">{message.timestamp}</div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">G</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span>Max-Hazoom is thinking</span>
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
                {action.split(',')[0]}
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
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
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

export default MaxHazoomChat;
