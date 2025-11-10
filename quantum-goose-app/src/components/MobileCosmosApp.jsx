import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileCosmosApp.css';

const MobileCosmosApp = () => {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('home');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [stars, setStars] = useState([]);
  const [nebulae, setNebulae] = useState([]);
  const [constellations, setConstellations] = useState([]);
  const canvasRef = useRef(null);

  const mobileScreens = [
    {
      id: 'home',
      title: 'Cosmos Portal',
      icon: '🌌',
      component: 'HomeScreen'
    },
    {
      id: 'travel',
      title: 'Travel',
      icon: '✈️',
      component: 'TravelScreen'
    },
    {
      id: 'explore',
      title: 'Explore',
      icon: '🔭',
      component: 'ExploreScreen'
    },
    {
      id: 'quantum',
      title: 'Quantum',
      icon: '⚛️',
      component: 'QuantumScreen'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: '👤',
      component: 'ProfileScreen'
    }
  ];

  const quickActions = [
    { id: 'magic-cube', title: 'Magic Cube', icon: '🎲', color: '#4169E1', route: '/magic-cube' },
    { id: 'earth', title: 'Earth View', icon: '🌍', color: '#228b22', route: '/magic-cube' },
    { id: 'world-map', title: 'World Map', icon: '🗺️', color: '#ff6496', route: '/magic-cube' },
    { id: 'quantum-hub', title: 'Quantum Hub', icon: '🌌', color: '#9c27b0', route: '/quantum-hub' },
    { id: 'ai-chat', title: 'AI Assistant', icon: '🤖', color: '#ff9800', route: '/quantum-navigator' },
    { id: 'memory', title: 'Memory System', icon: '💾', color: '#00bcd4', route: '/memory' }
  ];

  useEffect(() => {
    generateCosmosElements();
    animateCosmos();
  }, []);

  const generateCosmosElements = () => {
    // Generate stars
    const newStars = [];
    for (let i = 0; i < 200; i++) {
      newStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
    setStars(newStars);

    // Generate nebulae
    const newNebulae = [];
    for (let i = 0; i < 5; i++) {
      newNebulae.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 20,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        opacity: Math.random() * 0.3 + 0.1,
        rotationSpeed: Math.random() * 0.001 + 0.0005
      });
    }
    setNebulae(newNebulae);

    // Generate constellations
    const newConstellations = [];
    for (let i = 0; i < 3; i++) {
      const points = [];
      const centerX = Math.random() * 80 + 10;
      const centerY = Math.random() * 80 + 10;
      for (let j = 0; j < 5; j++) {
        points.push({
          x: centerX + (Math.random() - 0.5) * 20,
          y: centerY + (Math.random() - 0.5) * 20
        });
      }
      newConstellations.push({
        points: points,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    setConstellations(newConstellations);
  };

  const animateCosmos = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationTime = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach(nebula => {
        const gradient = ctx.createRadialGradient(
          (nebula.x / 100) * canvas.width,
          (nebula.y / 100) * canvas.height,
          0,
          (nebula.x / 100) * canvas.width,
          (nebula.y / 100) * canvas.height,
          (nebula.size / 100) * canvas.width
        );
        gradient.addColorStop(0, nebula.color.replace('50%', '30%').replace(')', `, ${nebula.opacity})`));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw constellations
      constellations.forEach(constellation => {
        ctx.strokeStyle = `rgba(100, 150, 255, ${constellation.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        constellation.points.forEach((point, index) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Draw constellation points
        constellation.points.forEach(point => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Draw stars
      stars.forEach(star => {
        const brightness = star.brightness + Math.sin(animationTime * star.twinkleSpeed) * 0.5;
        const x = (star.x / 100) * canvas.width;
        const y = (star.y / 100) * canvas.height;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationTime += 1;
      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = mobileScreens.findIndex(screen => screen.id === activeScreen);
      let newIndex;
      
      if (isLeftSwipe) {
        newIndex = (currentIndex + 1) % mobileScreens.length;
      } else {
        newIndex = currentIndex === 0 ? mobileScreens.length - 1 : currentIndex - 1;
      }
      
      setActiveScreen(mobileScreens[newIndex].id);
    }
  };

  const handleQuickAction = (action) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen quickActions={quickActions} onAction={handleQuickAction} />;
      case 'travel':
        return <TravelScreen navigate={navigate} />;
      case 'explore':
        return <ExploreScreen />;
      case 'quantum':
        return <QuantumScreen navigate={navigate} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen quickActions={quickActions} onAction={handleQuickAction} />;
    }
  };

  return (
    <div 
      className="mobile-cosmos-app"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas 
        ref={canvasRef}
        className="cosmos-background"
      />
      
      <div className="mobile-app-container">
        <div className="mobile-status-bar">
          <div className="status-left">
            <span className="time">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="status-right">
            <span className="signal">📶</span>
            <span className="wifi">📶</span>
            <span className="battery">🔋</span>
          </div>
        </div>

        <div className="mobile-screen">
          {renderScreen()}
        </div>

        <div className="mobile-navigation">
          {mobileScreens.map(screen => (
            <button
              key={screen.id}
              className={`nav-item ${activeScreen === screen.id ? 'active' : ''}`}
              onClick={() => setActiveScreen(screen.id)}
            >
              <span className="nav-icon">{screen.icon}</span>
              <span className="nav-label">{screen.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="swipe-indicator">
        <span className="swipe-text">Swipe to navigate</span>
        <div className="swipe-dots">
          {mobileScreens.map((screen, index) => (
            <div
              key={screen.id}
              className={`dot ${mobileScreens.findIndex(s => s.id === activeScreen) === index ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Screen Components
const HomeScreen = ({ quickActions, onAction }) => (
  <div className="screen-content home-screen">
    <div className="welcome-section">
      <h1 className="app-title">🌌 Cosmos Portal</h1>
      <p className="app-subtitle">Your Quantum Travel Companion</p>
    </div>

    <div className="quick-actions-grid">
      {quickActions.map(action => (
        <button
          key={action.id}
          className="quick-action-card"
          style={{ backgroundColor: action.color }}
          onClick={() => onAction(action)}
        >
          <div className="action-icon">{action.icon}</div>
          <div className="action-title">{action.title}</div>
        </button>
      ))}
    </div>

    <div className="cosmos-stats">
      <div className="stat-item">
        <span className="stat-value">∞</span>
        <span className="stat-label">Destinations</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">12</span>
        <span className="stat-label">Planets</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">47</span>
        <span className="stat-label">Routes</span>
      </div>
    </div>
  </div>
);

const TravelScreen = ({ navigate }) => (
  <div className="screen-content travel-screen">
    <h2>🚀 Travel Options</h2>
    <div className="travel-options">
      <button className="travel-option" onClick={() => navigate('/magic-cube')}>
        <span className="option-icon">🎲</span>
        <span className="option-title">Magic Cube</span>
        <span className="option-desc">Universal portal system</span>
      </button>
      <button className="travel-option" onClick={() => navigate('/magic-cube')}>
        <span className="option-icon">🌍</span>
        <span className="option-title">Earth View</span>
        <span className="option-desc">3D planet navigation</span>
      </button>
      <button className="travel-option" onClick={() => navigate('/magic-cube')}>
        <span className="option-icon">🗺️</span>
        <span className="option-title">World Map</span>
        <span className="option-desc">Global route planning</span>
      </button>
    </div>
  </div>
);

const ExploreScreen = () => (
  <div className="screen-content explore-screen">
    <h2>🔭 Explore Cosmos</h2>
    <div className="explore-content">
      <div className="explore-card">
        <span className="explore-icon">🌟</span>
        <h3>Star Systems</h3>
        <p>Discover distant stars and constellations</p>
      </div>
      <div className="explore-card">
        <span className="explore-icon">🌌</span>
        <h3>Nebulae</h3>
        <p>Explore colorful cosmic clouds</p>
      </div>
      <div className="explore-card">
        <span className="explore-icon">🪐</span>
        <h3>Planets</h3>
        <p>Visit exotic worlds</p>
      </div>
    </div>
  </div>
);

const QuantumScreen = ({ navigate }) => (
  <div className="screen-content quantum-screen">
    <h2>⚛️ Quantum Systems</h2>
    <div className="quantum-options">
      <button className="quantum-option" onClick={() => navigate('/quantum-hub')}>
        <span className="option-icon">🌌</span>
        <span className="option-title">Quantum Hub</span>
      </button>
      <button className="quantum-option" onClick={() => navigate('/quantum-navigator')}>
        <span className="option-icon">🧠</span>
        <span className="option-title">AI Navigator</span>
      </button>
      <button className="quantum-option" onClick={() => navigate('/memory')}>
        <span className="option-icon">💾</span>
        <span className="option-title">Memory System</span>
      </button>
    </div>
  </div>
);

const ProfileScreen = () => (
  <div className="screen-content profile-screen">
    <h2>👤 Travel Profile</h2>
    <div className="profile-content">
      <div className="profile-avatar">🚀</div>
      <h3>Quantum Traveler</h3>
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-number">127</span>
          <span className="stat-text">Journeys</span>
        </div>
        <div className="profile-stat">
          <span className="stat-number">42</span>
          <span className="stat-text">Planets</span>
        </div>
        <div className="profile-stat">
          <span className="stat-number">∞</span>
          <span className="stat-text">Miles</span>
        </div>
      </div>
    </div>
  </div>
);

export default MobileCosmosApp;