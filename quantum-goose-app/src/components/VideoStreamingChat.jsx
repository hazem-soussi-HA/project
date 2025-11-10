import React, { useState, useEffect, useRef, useCallback } from 'react';
import LLMService from '../services/llmService';
import './VideoStreamingChat.css';

const VideoStreamingChat = ({ sidebarCollapsed: externalCollapsed = false }) => {
  // Video States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState('disconnected'); // disconnected, connecting, connected, ringing
  const [callType, setCallType] = useState('video'); // video, audio, screen
  const [participants, setParticipants] = useState([]);
  
  // Chat States
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(externalCollapsed);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState('video'); // video, chat, participants, settings
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    setSidebarCollapsed(externalCollapsed);
    initializeMedia();
    initializeLLM();
  }, [externalCollapsed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
      // Fallback to audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        setLocalStream(stream);
        setIsVideoEnabled(false);
      } catch (audioError) {
        console.error('Failed to access audio:', audioError);
      }
    }
  };

  const initializeLLM = async () => {
    try {
      setConnectionStatus('connecting');
      const health = await LLMService.healthCheck();
      setConnectionStatus('connected');
      addSystemMessage('🎥 **HAZoom Video Chat Initialized!**\n\nAI-powered video communication with real-time transcription and translation capabilities.');
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
      setConnectionStatus('error');
      addSystemMessage('⚠️ Video chat initialized in offline mode. AI features limited.');
    }
  };

  const startCall = async (type = 'video') => {
    setCallType(type);
    setCallStatus('connecting');
    
    try {
      // Simulate connection (in real app, this would connect to signaling server)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCallStatus('connected');
      
      // Add AI assistant as participant
      const aiParticipant = {
        id: 'ai-assistant',
        name: 'HAZoom AI',
        avatar: '🤖',
        isAI: true,
        isSpeaking: false,
        isMuted: false
      };
      setParticipants([aiParticipant]);
      
      addSystemMessage(`📞 ${type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Screen'} call started!`);
      
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('disconnected');
      addSystemMessage('❌ Failed to start call. Please check your connection.');
    }
  };

  const endCall = () => {
    setCallStatus('disconnected');
    setParticipants([]);
    
    // Stop all remote streams
    remoteStreams.forEach((stream) => {
      stream.getTracks().forEach(track => track.stop());
    });
    setRemoteStreams(new Map());
    
    addSystemMessage('📞 Call ended.');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        if (localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current?.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        
      } catch (error) {
        console.error('Failed to share screen:', error);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    try {
      const stream = localStream;
      if (!stream) return;

      const options = {
        mimeType: 'video/webm;codecs=vp9,opus'
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hazoom-call-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      addSystemMessage('🔴 Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      addSystemMessage('❌ Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      addSystemMessage('⏹️ Recording saved');
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, 'user');

    // Process with AI for transcription/translation if connected
    if (connectionStatus === 'connected') {
      try {
        setIsTyping(true);
        const response = await LLMService.sendMessage(userMessage);
        addMessage(response, 'ai');
      } catch (error) {
        console.error('AI processing error:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const simulateTranscription = () => {
    // Simulate real-time transcription from audio
    const transcriptions = [
      "Hello, this is a test of the transcription system",
      "The AI is processing the audio in real-time",
      "Video quality looks good from here",
      "Can you hear me clearly?"
    ];
    
    const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
    addMessage(`🎤 [Transcription]: ${randomTranscription}`, 'transcription');
  };

  const getCallStatusColor = () => {
    switch (callStatus) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#fbbf24';
      case 'ringing': return '#60a5fa';
      case 'disconnected': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#fbbf24';
      case 'error': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="video-streaming-chat">
      <div className="video-header">
        <div className="header-left">
          <h1>🎥 HAZoom Video Chat</h1>
          <div className="status-indicators">
            <div className="status-indicator">
              <div className="status-dot" style={{ backgroundColor: getCallStatusColor() }}></div>
              <span>Call: {callStatus}</span>
            </div>
            <div className="status-indicator">
              <div className="status-dot" style={{ backgroundColor: getConnectionStatusColor() }}></div>
              <span>AI: {connectionStatus}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          {isRecording && <div className="recording-indicator">🔴 REC</div>}
        </div>
      </div>

      <div className="video-main">
        {/* Video Area */}
        <div className="video-area">
          {callStatus === 'disconnected' ? (
            <div className="call-setup">
              <div className="setup-content">
                <h2>🎥 Start a Video Call</h2>
                <p>Choose your call type to begin communication</p>
                
                <div className="call-options">
                  <button 
                    className="call-option-btn video-btn"
                    onClick={() => startCall('video')}
                  >
                    <span className="call-icon">📹</span>
                    <span className="call-label">Video Call</span>
                    <span className="call-desc">Camera + Microphone</span>
                  </button>
                  
                  <button 
                    className="call-option-btn audio-btn"
                    onClick={() => startCall('audio')}
                  >
                    <span className="call-icon">🎤</span>
                    <span className="call-label">Audio Call</span>
                    <span className="call-desc">Voice Only</span>
                  </button>
                  
                  <button 
                    className="call-option-btn screen-btn"
                    onClick={() => startCall('screen')}
                  >
                    <span className="call-icon">🖥️</span>
                    <span className="call-label">Screen Share</span>
                    <span className="call-desc">Share Your Screen</span>
                  </button>
                </div>

                <div className="ai-features">
                  <h3>🤖 AI-Powered Features</h3>
                  <div className="feature-list">
                    <div className="feature-item">
                      <span className="feature-icon">🎤</span>
                      <span>Real-time Transcription</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🌍</span>
                      <span>Live Translation</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📝</span>
                      <span>Meeting Summary</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🔍</span>
                      <span>Content Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="active-call">
              {/* Local Video */}
              <div className="video-container local-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`video-feed ${isVideoEnabled ? '' : 'disabled'}`}
                />
                <div className="video-overlay">
                  <div className="participant-info">
                    <span className="participant-name">You</span>
                    {!isAudioEnabled && <span className="muted-indicator">🔇</span>}
                  </div>
                </div>
              </div>

              {/* Remote Videos */}
              <div className="remote-videos">
                {participants.map(participant => (
                  <div key={participant.id} className="video-container remote-video">
                    {participant.isAI ? (
                      <div className="ai-participant">
                        <div className="ai-avatar">{participant.avatar}</div>
                        <div className="ai-status">
                          <span className="ai-name">{participant.name}</span>
                          <span className="ai-status-text">AI Assistant Active</span>
                        </div>
                      </div>
                    ) : (
                      <video
                        ref={el => {
                          if (el) remoteVideoRefs.current.set(participant.id, el);
                        }}
                        autoPlay
                        playsInline
                        className="video-feed"
                      />
                    )}
                    <div className="video-overlay">
                      <div className="participant-info">
                        <span className="participant-name">{participant.name}</span>
                        {participant.isMuted && <span className="muted-indicator">🔇</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Controls */}
          {callStatus !== 'disconnected' && (
            <div className="call-controls">
              <button 
                className={`control-btn ${isVideoEnabled ? 'active' : 'disabled'}`}
                onClick={toggleVideo}
                title="Toggle Video"
              >
                {isVideoEnabled ? '📹' : '📹❌'}
              </button>
              
              <button 
                className={`control-btn ${isAudioEnabled ? 'active' : 'disabled'}`}
                onClick={toggleAudio}
                title="Toggle Audio"
              >
                {isAudioEnabled ? '🎤' : '🎤❌'}
              </button>
              
              <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                onClick={toggleScreenShare}
                title="Share Screen"
              >
                🖥️
              </button>
              
              <button 
                className={`control-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                title="Record Call"
              >
                {isRecording ? '⏹️' : '⏺️'}
              </button>
              
              <button 
                className="control-btn end-call"
                onClick={endCall}
                title="End Call"
              >
                📞❌
              </button>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-tabs">
            <button 
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button 
              className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              👥 People
            </button>
            <button 
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 AI
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="chat-content">
              <div className="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-avatar">
                      {message.sender === 'user' ? 'U' : 
                       message.sender === 'ai' ? '🤖' : 
                       message.sender === 'transcription' ? '🎤' : 'S'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-timestamp">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows="2"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="send-btn"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="participants-content">
              <h3>Participants ({participants.length + 1})</h3>
              <div className="participants-list">
                <div className="participant-item">
                  <div className="participant-avatar">👤</div>
                  <div className="participant-info">
                    <span className="participant-name">You</span>
                    <span className="participant-status">Host</span>
                  </div>
                </div>
                {participants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">{participant.avatar}</div>
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      <span className="participant-status">
                        {participant.isAI ? 'AI Assistant' : 'Participant'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="ai-content">
              <h3>🤖 AI Assistant</h3>
              <div className="ai-features-panel">
                <div className="ai-feature">
                  <h4>🎤 Live Transcription</h4>
                  <p>Real-time speech-to-text conversion</p>
                  <button onClick={simulateTranscription} className="ai-action-btn">
                    Test Transcription
                  </button>
                </div>
                
                <div className="ai-feature">
                  <h4>🌍 Translation</h4>
                  <p>Auto-translate to multiple languages</p>
                  <select className="language-select">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
                
                <div className="ai-feature">
                  <h4>📝 Meeting Summary</h4>
                  <p>AI-generated meeting notes</p>
                  <button className="ai-action-btn">
                    Generate Summary
                  </button>
                </div>
                
                <div className="ai-feature">
                  <h4>🔍 Content Analysis</h4>
                  <p>Analyze shared content and discussions</p>
                  <button className="ai-action-btn">
                    Analyze Content
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStreamingChat;