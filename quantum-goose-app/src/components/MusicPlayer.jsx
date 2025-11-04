import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

const MusicPlayer = ({ isSidebarCollapsed }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  const tracks = [
    {
      id: 1,
      title: "Quantum Echoes",
      artist: "Neural Symphony",
      description: "Ambient quantum frequencies",
      duration: 180, // 3 minutes
      type: "ambient"
    },
    {
      id: 2,
      title: "Cube Meditation",
      artist: "3D Consciousness",
      description: "Meditative cube vibrations",
      duration: 240, // 4 minutes
      type: "meditative"
    },
    {
      id: 3,
      title: "Nebula Dreams",
      artist: "Space Collective",
      description: "Cosmic journey through time",
      duration: 300, // 5 minutes
      type: "cinematic"
    },
    {
      id: 4,
      title: "Mini-Max Harmony",
      artist: "Algorithm Orchestra",
      description: "Mathematical music generation",
      duration: 200, // 3.3 minutes
      type: "algorithmic"
    }
  ];

  const quantumBackgrounds = {
    ambient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    meditative: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cinematic: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    algorithmic: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  };

  // Simulate audio playback with interval
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= tracks[currentTrack].duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, tracks[currentTrack].duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTime(0);
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTime(0);
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const changeTrack = (index) => {
    setCurrentTime(0);
    setCurrentTrack(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / tracks[currentTrack].duration) * 100;

  return (
    <div className={`music-player ${isExpanded ? 'expanded' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="player-controls">
        <div className="track-info" style={{ background: quantumBackgrounds[tracks[currentTrack].type] }}>
          <div className="track-details">
            <h4>{tracks[currentTrack].title}</h4>
            <p>{tracks[currentTrack].artist}</p>
            <span className="track-description">{tracks[currentTrack].description}</span>
          </div>
          
          <div className="control-buttons">
            <button onClick={prevTrack} className="control-btn">⏮️</button>
            <button onClick={togglePlay} className="control-btn primary">
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={nextTrack} className="control-btn">⏭️</button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="control-btn expand-btn"
            >
              {isExpanded ? '📻' : '🎵'}
            </button>
          </div>
        </div>

        <div className="progress-section">
          <span className="time-display">{formatTime(currentTime)}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="time-display">{formatTime(tracks[currentTrack].duration)}</span>
        </div>

        <div className="volume-section">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="track-playlist">
          <h5>Quantum Playlist</h5>
          <div className="track-list">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`track-item ${index === currentTrack ? 'active' : ''}`}
                onClick={() => changeTrack(index)}
                style={{ background: index === currentTrack ? quantumBackgrounds[track.type] : 'rgba(255,255,255,0.1)' }}
              >
                <div className="track-item-info">
                  <span className="track-number">{index + 1}</span>
                  <div className="track-text">
                    <strong>{track.title}</strong>
                    <p>{track.artist}</p>
                  </div>
                </div>
                <span className="track-duration">{formatTime(track.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
