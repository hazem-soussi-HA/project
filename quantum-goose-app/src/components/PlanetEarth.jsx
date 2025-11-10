import React, { useState, useEffect, useRef } from 'react';
import './PlanetEarth.css';
import WorldMapRouter from './WorldMapRouter';

const PlanetEarth = ({ onTravelComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [cloudRotation, setCloudRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMapRouter, setShowMapRouter] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (autoRotate) {
      const rotationInterval = setInterval(() => {
        setRotation(prev => (prev + 0.5) % 360);
        setCloudRotation(prev => (prev + 0.3) % 360);
      }, 50);
      return () => clearInterval(rotationInterval);
    }
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;

    const drawStars = () => {
      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        const opacity = Math.random() * 0.8 + 0.2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawStars();
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleEarthClick = () => {
    setShowDetails(!showDetails);
  };

  const handleTravelToEarth = () => {
    setZoomLevel(3);
    setTimeout(() => {
      onTravelComplete && onTravelComplete();
    }, 2000);
  };

  const handleDirection = (direction) => {
    setAutoRotate(false);
    switch(direction) {
      case 'north':
        setTilt(prev => Math.max(prev - 15, -60));
        break;
      case 'south':
        setTilt(prev => Math.min(prev + 15, 60));
        break;
      case 'east':
        setRotation(prev => (prev + 30) % 360);
        break;
      case 'west':
        setRotation(prev => (prev - 30 + 360) % 360);
        break;
      case 'reset':
        setRotation(0);
        setTilt(0);
        setZoomLevel(1);
        setAutoRotate(true);
        break;
      default:
        break;
    }
  };

  const handleManualRotate = (axis, value) => {
    setAutoRotate(false);
    if (axis === 'x') {
      setTilt(value);
    } else {
      setRotation(value);
    }
  };

  if (showMapRouter) {
    return (
      <WorldMapRouter 
        onRouteComplete={(destination) => {
          setShowMapRouter(false);
          onTravelComplete && onTravelComplete();
        }}
        onBackToEarth={() => setShowMapRouter(false)}
      />
    );
  }

  return (
    <div className="planet-earth-container">
      <div className="space-background">
        <canvas ref={canvasRef} className="stars-canvas" />
      </div>
      
      <div className="earth-viewport">
        <div 
          className="earth-container"
          style={{
            transform: `scale(${zoomLevel})`
          }}
        >
          <div 
            className="planet-earth"
            style={{
              transform: `rotateX(${tilt}deg) rotateY(${rotation}deg)`
            }}
            onClick={handleEarthClick}
          >
            <div className="earth-surface">
              <div className="continent continent-1"></div>
              <div className="continent continent-2"></div>
              <div className="continent continent-3"></div>
              <div className="continent continent-4"></div>
              <div className="ocean"></div>
            </div>
            
            <div 
              className="cloud-layer"
              style={{
                transform: `rotateY(${cloudRotation}deg)`
              }}
            >
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>
            </div>
            
            <div className="atmosphere"></div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="earth-details">
          <h3>Planet Earth</h3>
          <div className="earth-stats">
            <div className="stat">
              <span className="stat-label">Diameter:</span>
              <span className="stat-value">12,742 km</span>
            </div>
            <div className="stat">
              <span className="stat-label">Distance from Sun:</span>
              <span className="stat-value">149.6M km</span>
            </div>
            <div className="stat">
              <span className="stat-label">Population:</span>
              <span className="stat-value">8.1 Billion</span>
            </div>
            <div className="stat">
              <span className="stat-label">Atmosphere:</span>
              <span className="stat-value">78% N₂, 21% O₂</span>
            </div>
            <div className="stat">
              <span className="stat-label">Moons:</span>
              <span className="stat-value">1 (Luna)</span>
            </div>
          </div>
        </div>
      )}

      <div className="directional-controls">
        <div className="compass-rose">
          <button className="direction-btn north" onClick={() => handleDirection('north')}>
            ↑ N
          </button>
          <div className="compass-middle">
            <button className="direction-btn west" onClick={() => handleDirection('west')}>
              ← W
            </button>
            <div className="compass-center">
              <div className="compass-dot"></div>
            </div>
            <button className="direction-btn east" onClick={() => handleDirection('east')}>
              E →
            </button>
          </div>
          <button className="direction-btn south" onClick={() => handleDirection('south')}>
            S ↓
          </button>
        </div>
      </div>

      <div className="earth-controls">
        <button className="earth-btn" onClick={handleZoomOut}>
          🔍−
        </button>
        <button className="earth-btn" onClick={handleZoomIn}>
          🔍+
        </button>
        <button className="earth-btn primary" onClick={handleTravelToEarth}>
          🚀 Travel to Surface
        </button>
        <button className="earth-btn" onClick={() => setShowDetails(!showDetails)}>
          📊 {showDetails ? 'Hide' : 'Show'} Info
        </button>
        <button className="earth-btn" onClick={() => setAutoRotate(!autoRotate)}>
          {autoRotate ? '⏸ Pause' : '▶ Auto-Rotate'}
        </button>
        <button className="earth-btn reset" onClick={() => handleDirection('reset')}>
          🔄 Reset View
        </button>
        <button className="earth-btn map-btn" onClick={() => setShowMapRouter(true)}>
          🗺️ Route Map
        </button>
      </div>

      <div className="rotation-sliders">
        <div className="slider-control">
          <label>Rotation: {Math.round(rotation)}°</label>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={rotation}
            onChange={(e) => handleManualRotate('y', parseInt(e.target.value))}
            className="rotation-slider"
          />
        </div>
        <div className="slider-control">
          <label>Tilt: {Math.round(tilt)}°</label>
          <input 
            type="range" 
            min="-60" 
            max="60" 
            value={tilt}
            onChange={(e) => handleManualRotate('x', parseInt(e.target.value))}
            className="rotation-slider"
          />
        </div>
      </div>

      <div className="earth-info">
        <h2>Planet Earth</h2>
        <p>Our home planet - the third rock from the Sun</p>
        <p className="zoom-indicator">Zoom: {Math.round(zoomLevel * 100)}%</p>
      </div>
    </div>
  );
};

export default PlanetEarth;