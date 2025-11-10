import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuantumHub.css';

const QuantumHub = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [systemStatus, setSystemStatus] = useState({
    quantumCore: 'online',
    travelPortal: 'active',
    weatherSystem: 'online',
    terrainMapper: 'online',
    worldClock: 'online',
    aiAssistant: 'online'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivity, setRecentActivity] = useState([
    { action: 'Traveled to', destination: 'Tokyo', time: '2 min ago', icon: '✈️' },
    { action: 'Checked weather in', destination: 'London', time: '15 min ago', icon: '🌤️' },
    { action: 'Viewed terrain of', destination: 'Sydney', time: '1 hour ago', icon: '🏔️' },
    { action: 'Opened portal to', destination: 'New York', time: '2 hours ago', icon: '🌀' }
  ]);

  const travelSystems = [
    {
      id: 'magic-cube',
      title: 'Magic Travel Cube',
      description: 'Universal portal system with quantum navigation',
      icon: '🎲',
      route: '/magic-cube',
      status: 'active',
      category: 'travel',
      features: ['3D Portal', 'Multiple Destinations', 'Real-time Travel'],
      color: '#4169E1'
    },
    {
      id: 'earth-view',
      title: 'Planet Earth',
      description: 'Interactive 3D Earth with directional controls',
      icon: '🌍',
      route: '/magic-cube',
      status: 'active',
      category: 'travel',
      features: ['3D Rotation', 'Compass Navigation', 'Zoom Controls'],
      color: '#228b22'
    },
    {
      id: 'world-map',
      title: 'World Map Router',
      description: 'Global route planning with weather and terrain',
      icon: '🗺️',
      route: '/magic-cube',
      status: 'active',
      category: 'navigation',
      features: ['Route Planning', 'Weather Data', 'Terrain Maps'],
      color: '#ff6496'
    },
    {
      id: 'quantum-navigator',
      title: 'Quantum Navigator',
      description: 'AI-powered travel assistant',
      icon: '🧠',
      route: '/quantum-navigator',
      status: 'active',
      category: 'ai',
      features: ['AI Chat', 'Travel Suggestions', 'Smart Routing'],
      color: '#9c27b0'
    },
    {
      id: 'memory-system',
      title: 'Memory Dashboard',
      description: 'Persistent travel memory and history',
      icon: '💾',
      route: '/memory',
      status: 'active',
      category: 'data',
      features: ['Travel History', 'Favorites', 'Statistics'],
      color: '#ff9800'
    },
    {
      id: 'system-intelligence',
      title: 'System Intelligence',
      description: 'System monitoring and diagnostics',
      icon: '🖥️',
      route: '/llm/system-info',
      status: 'active',
      category: 'system',
      features: ['System Status', 'Performance', 'Diagnostics'],
      color: '#607d8b'
    }
  ];

  const quickActions = [
    { title: 'Quick Travel', icon: '🚀', action: () => navigate('/magic-cube'), color: '#4169E1' },
    { title: 'Weather Check', icon: '🌤️', action: () => navigate('/magic-cube'), color: '#03a9f4' },
    { title: 'Route Plan', icon: '🗺️', action: () => navigate('/magic-cube'), color: '#ff6496' },
    { title: 'AI Assistant', icon: '🤖', action: () => navigate('/quantum-navigator'), color: '#9c27b0' },
    { title: 'System Status', icon: '⚡', action: () => navigate('/llm/system-info'), color: '#4caf50' },
    { title: 'Travel History', icon: '📊', action: () => navigate('/memory'), color: '#ff9800' }
  ];

  const destinations = [
    { name: 'New York', icon: '🗽', temp: '22°C', time: 'EST', recent: true },
    { name: 'London', icon: '🇬🇧', temp: '18°C', time: 'GMT', recent: true },
    { name: 'Tokyo', icon: '🗾', temp: '26°C', time: 'JST', recent: true },
    { name: 'Paris', icon: '🗼', temp: '20°C', time: 'CET', recent: false },
    { name: 'Sydney', icon: '🦘', temp: '24°C', time: 'AEST', recent: false }
  ];

  useEffect(() => {
    // Simulate real-time system updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        quantumCore: Math.random() > 0.1 ? 'online' : 'updating',
        travelPortal: Math.random() > 0.05 ? 'active' : 'standby'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSystemClick = (system) => {
    if (system.route) {
      navigate(system.route);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'active': return '#03a9f4';
      case 'standby': return '#ff9800';
      case 'updating': return '#9c27b0';
      default: return '#f44336';
    }
  };

  const filteredSystems = travelSystems.filter(system =>
    system.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="quantum-hub">
      <div className="hub-header">
        <div className="hub-title">
          <h1>🌌 Quantum Hub</h1>
          <p>Central Navigation & Control Center</p>
        </div>
        
        <div className="hub-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search destinations, systems, features..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        <div className="system-status-bar">
          {Object.entries(systemStatus).map(([key, status]) => (
            <div key={key} className="status-item">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(status) }}
              ></div>
              <span className="status-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hub-content">
        <div className="hub-sidebar">
          <div className="nav-sections">
            <div className="nav-section">
              <h3>Navigation</h3>
              <div className="nav-items">
                {['overview', 'travel', 'navigation', 'ai'].map(section => (
                  <button
                    key={section}
                    className={`nav-item ${activeSection === section ? 'active' : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="nav-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={action.action}
                    style={{ backgroundColor: action.color }}
                  >
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hub-main">
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="overview-cards">
                <div className="stat-card">
                  <div className="stat-icon">🌍</div>
                  <div className="stat-content">
                    <h3>12</h3>
                    <p>Destinations</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✈️</div>
                  <div className="stat-content">
                    <h3>47</h3>
                    <p>Routes Available</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌤️</div>
                  <div className="stat-content">
                    <h3>Live</h3>
                    <p>Weather Data</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <h3>100%</h3>
                    <p>System Health</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-icon">{activity.icon}</span>
                      <div className="activity-content">
                        <span className="activity-text">
                          {activity.action} <strong>{activity.destination}</strong>
                        </span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="systems-grid">
            {filteredSystems.map(system => (
              <div
                key={system.id}
                className="system-card"
                onClick={() => handleSystemClick(system)}
                style={{ borderLeftColor: system.color }}
              >
                <div className="system-header">
                  <div className="system-icon" style={{ backgroundColor: system.color }}>
                    {system.icon}
                  </div>
                  <div className="system-status">
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(system.status) }}
                    ></div>
                    <span className="status-text">{system.status}</span>
                  </div>
                </div>
                
                <div className="system-content">
                  <h3>{system.title}</h3>
                  <p>{system.description}</p>
                  
                  <div className="system-features">
                    {system.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="system-footer">
                  <span className="system-category">{system.category}</span>
                  <button className="launch-btn">Launch →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hub-sidebar-right">
          <div className="destinations-panel">
            <h3>Popular Destinations</h3>
            <div className="destinations-list">
              {destinations.map((dest, index) => (
                <div key={index} className="destination-item">
                  <div className="dest-icon">{dest.icon}</div>
                  <div className="dest-info">
                    <div className="dest-name">{dest.name}</div>
                    <div className="dest-details">
                      <span className="dest-temp">{dest.temp}</span>
                      <span className="dest-time">{dest.time}</span>
                    </div>
                  </div>
                  {dest.recent && <div className="recent-badge">Recent</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="system-monitor">
            <h3>System Monitor</h3>
            <div className="monitor-stats">
              <div className="monitor-item">
                <span className="monitor-label">CPU Usage</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '35%' }}></div>
                </div>
                <span className="monitor-value">35%</span>
              </div>
              <div className="monitor-item">
                <span className="monitor-label">Memory</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '62%' }}></div>
                </div>
                <span className="monitor-value">62%</span>
              </div>
              <div className="monitor-item">
                <span className="monitor-label">Network</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '18%' }}></div>
                </div>
                <span className="monitor-value">18%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumHub;