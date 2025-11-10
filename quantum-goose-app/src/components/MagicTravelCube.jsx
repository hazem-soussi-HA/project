import React, { useState, useEffect, useRef } from 'react';
import './MagicTravelCube.css';
import PlanetEarth from './PlanetEarth';

const MagicTravelCube = () => {
  const [isRotating, setIsRotating] = useState(true);
  const [portalActive, setPortalActive] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [particles, setParticles] = useState([]);
  const [showEarthView, setShowEarthView] = useState(false);
  const canvasRef = useRef(null);

  const destinations = [
    { id: 1, name: "Planet Earth", color: "#4169E1", distance: "0 light-years", special: "earth" },
    { id: 2, name: "Nebula Dreams", color: "#ff6b9d", distance: "2.5M light-years" },
    { id: 3, name: "Crystal Galaxy", color: "#66d9ef", distance: "5.8M light-years" },
    { id: 4, name: "Quantum Void", color: "#a29bfe", distance: "∞" },
    { id: 5, name: "Star Garden", color: "#55efc4", distance: "1.2M light-years" },
    { id: 6, name: "Time Portal", color: "#fd79a8", distance: "Temporal" },
    { id: 7, name: "Dimension X", color: "#fdcb6e", distance: "Multi-dimensional" }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleArray = [];
    for (let i = 0; i < 100; i++) {
      particleArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 - 1.5,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
    setParticles(particleArray);

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particleArray.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    if (portalActive) {
      animate();
    }

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [portalActive]);

  const handleCubeClick = () => {
    setPortalActive(!portalActive);
    if (!portalActive) {
      createPortalEffect();
      playSound('portal');
    } else {
      playSound('close');
    }
  };

  const createPortalEffect = () => {
    const cube = document.querySelector('.magic-cube');
    cube.style.animation = 'none';
    setTimeout(() => {
      cube.style.animation = 'portalOpen 2s ease-in-out';
    }, 10);
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    playSound('select');
    initiateTravel(destination);
  };

  const playSound = (type) => {
    const audio = new Audio();
    switch(type) {
      case 'portal':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        break;
      case 'travel':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        break;
      case 'select':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        break;
      default:
        return;
    }
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const initiateTravel = (destination) => {
    if (destination.special === 'earth') {
      const cube = document.querySelector('.magic-cube');
      cube.style.animation = 'travelSequence 3s ease-in-out';
      playSound('travel');
      
      setTimeout(() => {
        setShowEarthView(true);
        setPortalActive(false);
      }, 3000);
    } else {
      const cube = document.querySelector('.magic-cube');
      cube.style.animation = 'travelSequence 3s ease-in-out';
      playSound('travel');
      
      setTimeout(() => {
        alert(`Traveling to ${destination.name}! Distance: ${destination.distance}`);
        setPortalActive(false);
        setSelectedDestination(null);
      }, 3000);
    }
  };

  if (showEarthView) {
    return (
      <PlanetEarth 
        onTravelComplete={() => {
          setShowEarthView(false);
          setSelectedDestination(null);
        }}
      />
    );
  }

  return (
    <div className="magic-travel-container">
      <canvas 
        ref={canvasRef}
        className={`particle-canvas ${portalActive ? 'active' : ''}`}
      />
      
      <div className="magic-cube-wrapper">
        <div 
          className={`magic-cube ${isRotating ? 'rotating' : ''} ${portalActive ? 'portal-active' : ''}`}
          onClick={handleCubeClick}
        >
          <div className="cube-face cube-front">
            <div className="cube-symbol">✦</div>
          </div>
          <div className="cube-face cube-back">
            <div className="cube-symbol">◈</div>
          </div>
          <div className="cube-face cube-right">
            <div className="cube-symbol">❋</div>
          </div>
          <div className="cube-face cube-left">
            <div className="cube-symbol">✧</div>
          </div>
          <div className="cube-face cube-top">
            <div className="cube-symbol">⟡</div>
          </div>
          <div className="cube-face cube-bottom">
            <div className="cube-symbol">✦</div>
          </div>
        </div>
      </div>

      {portalActive && (
        <div className="destinations-panel">
          <h3>Choose Your Destination</h3>
          <div className="destinations-grid">
            {destinations.map(dest => (
              <div
                key={dest.id}
                className="destination-card"
                style={{ borderColor: dest.color }}
                onClick={() => handleDestinationSelect(dest)}
              >
                <div className="destination-preview" style={{ background: `linear-gradient(135deg, ${dest.color}22, ${dest.color}44)` }}>
                  <div className="destination-icon" style={{ color: dest.color }}>
                    {dest.special === 'earth' ? '🌍' : '◉'}
                  </div>
                </div>
                <h4>{dest.name}</h4>
                <p>{dest.distance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="controls">
        <button 
          className="control-btn"
          onClick={() => {
            setIsRotating(!isRotating);
            playSound('select');
          }}
        >
          {isRotating ? '⏸ Pause' : '▶ Rotate'}
        </button>
        <button 
          className="control-btn portal-btn"
          onClick={() => {
            setPortalActive(!portalActive);
            playSound(portalActive ? 'close' : 'portal');
          }}
        >
          {portalActive ? '🌌 Close Portal' : '🚪 Open Portal'}
        </button>
      </div>

      <div className="info-panel">
        <h2>Magic Travel Cube</h2>
        <p>Click the cube to activate the universal portal system</p>
        {selectedDestination && (
          <div className="selected-destination">
            <p>Selected: <span style={{ color: selectedDestination.color }}>{selectedDestination.name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicTravelCube;