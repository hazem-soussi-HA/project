import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuantumTravel.css';

const QuantumTravel = ({ isSidebarCollapsed }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentDestination, setCurrentDestination] = useState('');
  const [travelProgress, setTravelProgress] = useState(0);
  const [travelSpeed, setTravelSpeed] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  const destinations = [
    {
      id: 'dashboard',
      name: 'Quantum Hub',
      description: 'Central navigation point',
      icon: '🏠',
      route: '/',
      color: '#667eea',
      experience: 'Navigation Center'
    },
    {
      id: 'quantum-navigator',
      name: 'AI Navigator',
      description: 'Chat with quantum AI',
      icon: '🧠',
      route: '/quantum-navigator',
      color: '#f093fb',
      experience: 'Artificial Intelligence'
    },
    {
      id: 'quantum-cube',
      name: 'Cube Universe',
      description: 'Immersive 3D experience',
      icon: '🧊',
      route: '/quantum-cube',
      color: '#4facfe',
      experience: '3D Visualization'
    },
    {
      id: 'max-hazoom-chat',
      name: 'Chat Portal',
      description: 'Enhanced communication',
      icon: '💬',
      route: '/max-hazoom-chat',
      color: '#43e97b',
      experience: 'Communication Hub'
    },
    {
      id: 'legacy-cube',
      name: 'Legacy Portal',
      description: 'Original cube experience',
      icon: '🔮',
      route: '/legacy-cube',
      color: '#f5576c',
      experience: 'Classic 3D Cube'
    }
  ];

  const [currentLocation, setCurrentLocation] = useState('dashboard');

  // Simulate quantum travel animation
  const startTravel = (destination) => {
    if (isActive) return;
    
    setIsActive(true);
    setCurrentDestination(destination.name);
    setTravelProgress(0);
    
    // Animate travel progress
    const interval = setInterval(() => {
      setTravelProgress(prev => {
        const newProgress = prev + (2 * travelSpeed);
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsActive(false);
          navigate(destination.route);
          setCurrentLocation(destination.id);
          return 0;
        }
        return newProgress;
      });
    }, 50);
  };

  // Quantum travel effects
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1
      });
    }
    return stars;
  };

  const [stars] = useState(generateStars());

  return (
    <div className={`quantum-travel ${isActive ? 'traveling' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Travel Map Interface */}
      {showMap && (
        <div className="travel-map">
          <div className="map-header">
            <h3>🗺️ Quantum Travel Map</h3>
            <button onClick={() => setShowMap(false)}>✕</button>
          </div>
          <div className="map-destinations">
            {destinations.map(dest => (
              <div
                key={dest.id}
                className={`map-destination ${currentLocation === dest.id ? 'current' : ''}`}
                onClick={() => !isActive && startTravel(dest)}
                style={{ 
                  background: `linear-gradient(135deg, ${dest.color}40, ${dest.color}20)`,
                  borderColor: dest.color
                }}
              >
                <div className="destination-icon">{dest.icon}</div>
                <div className="destination-info">
                  <h4>{dest.name}</h4>
                  <p>{dest.description}</p>
                  <span className="experience-tag">{dest.experience}</span>
                </div>
                {currentLocation === dest.id && <div className="current-location">📍</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel Portal */}
      <div className="travel-portal">
        <div className="portal-header">
          <h3>🌌 Quantum Travel Portal</h3>
          <button 
            className="map-toggle"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
        </div>

        {isActive ? (
          <div className="travel-animation">
            <div className="travel-wormhole">
              <div className="wormhole-core">
                <div className="wormhole-rings">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`ring ring-${i}`}></div>
                  ))}
                </div>
                <div className="travel-destination">
                  <div className="destination-icon">{destinations.find(d => d.name === currentDestination)?.icon}</div>
                  <h4>Traveling to {currentDestination}</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${travelProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{Math.round(travelProgress)}%</span>
                </div>
              </div>
            </div>
            
            {/* Star field background */}
            <div className="star-field">
              {stars.map(star => (
                <div
                  key={star.id}
                  className="star"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDelay: `${star.speed * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="destination-grid">
            {destinations.map(dest => (
              <div
                key={dest.id}
                className={`destination-card ${currentLocation === dest.id ? 'current-location' : ''}`}
                onClick={() => startTravel(dest)}
                style={{ 
                  background: `linear-gradient(135deg, ${dest.color}40, ${dest.color}10)`,
                  borderColor: dest.color
                }}
              >
                <div className="destination-icon">{dest.icon}</div>
                <h4>{dest.name}</h4>
                <p>{dest.description}</p>
                <div className="travel-info">
                  <span className="experience-tag">{dest.experience}</span>
                  <button className="travel-btn">
                    🚀 Travel
                  </button>
                </div>
                {currentLocation === dest.id && <div className="location-indicator">📍 Current</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Travel Controls */}
      <div className="travel-controls">
        <div className="speed-control">
          <label>Travel Speed:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={travelSpeed}
            onChange={(e) => setTravelSpeed(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <span>{travelSpeed}x</span>
        </div>
        
        <div className="travel-status">
          <span>Current Location: {destinations.find(d => d.id === currentLocation)?.name}</span>
          {isActive && <span className="traveling-indicator">🌌 Traveling...</span>}
        </div>
      </div>
    </div>
  );
};

export default QuantumTravel;
