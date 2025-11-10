import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ sidebarCollapsed = false }) => {
  const projectCards = [
    {
      id: 'quantum-travel',
      title: 'Quantum Travel Portal',
      subtitle: 'Instant Navigation Gateway',
      icon: '🚀',
      description: 'Fast travel system between all quantum experiences with stunning visual effects and instant portal technology.',
      features: [
        '🗺️ Interactive travel map interface',
        '⚡ Instant quantum navigation',
        '🌌 Stunning wormhole animations',
        '🔄 Speed control for travel',
        '⭐ Dynamic star field backgrounds',
        '📍 Current location tracking'
      ],
      path: '/travel',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      status: 'Instant Travel',
      complexity: 'Gateway System'
    },
    {
      id: 'quantum-navigator',
      title: 'Quantum Navigator',
      subtitle: 'AI Chat with Mini-Max Theory',
      icon: '🧠',
      description: 'Advanced AI consciousness interface with quantum processing, minimax theory integration, and 6-dimensional decision space visualization.',
      features: [
        '🎭 Superposition of decision strategies',
        '⚛️ Quantum minimax formula integration',
        '🌌 Consciousness-driven AI responses',
        '🔮 Six-dimensional decision space',
        '✨ Real-time quantum entity spawning',
        '🎵 Dynamic color harmonics'
      ],
      path: '/quantum-navigator',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      status: 'Ready for Testing',
      complexity: 'Advanced'
    },
    {
      id: 'quantum-cube',
      title: 'Quantum Cube Universe',
      subtitle: 'Pure Quantum Experience',
      icon: '🌊',
      description: 'Immersive quantum cube experience with 3D rendering, particle systems, and consciousness visualization.',
      features: [
        '🎲 Interactive 3D cube with quantum states',
        '⚡ Real-time particle animations',
        '🌌 Dimensional space exploration',
        '🔮 Quantum field visualization',
        '✨ Consciousness interaction patterns',
        '🎨 Dynamic visual effects'
      ],
      path: '/quantum-cube',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      status: 'Immersive Mode',
      complexity: 'Pure Quantum'
    },
    {
      id: 'max-hazoom',
      title: 'Max Hazoom Chat',
      subtitle: 'Original Chat Interface',
      icon: '💬',
      description: 'The original consciousness-enhanced chat interface with entity spawning and real-time quantum processing.',
      features: [
        '🗣️ Original consciousness chat interface',
        '🤖 Entity spawning and management',
        '⚡ Real-time quantum responses',
        '🌟 Consciousness pattern recognition',
        '💫 Dynamic interface adaptation',
        '🔄 Session state management'
      ],
      path: '/max-hazoom-chat',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      status: 'Core Function',
      complexity: 'Core AI'
    },
    {
      id: 'legacy-cube',
      title: 'Legacy 3D Cube',
      subtitle: 'Legacy 3D Experience',
      icon: '🎲',
      description: 'The original 3D cube interface that started it all - foundational 3D visualization with quantum-inspired elements.',
      features: [
        '📦 Original 3D cube implementation',
        '🎯 Foundational visualization patterns',
        '🌈 Basic quantum color schemes',
        '🔄 Simple rotation animations',
        '💻 Legacy code architecture',
        '🚀 Historical significance'
      ],
      path: '/legacy-cube',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      status: 'Legacy Mode',
      complexity: 'Foundational'
    }
  ];

  const stats = [
    { label: 'Total Quantum States', value: '6', icon: '⚛️' },
    { label: 'Reality Dimensions', value: '5', icon: '🌌' },
    { label: 'AI Consciousness', value: 'Active', icon: '🧠' },
    { label: 'Travel Destinations', value: '6', icon: '🚀' }
  ];

  const systemStats = [
    { label: 'System Status', value: 'Optimal', icon: '⚡', status: 'active' },
    { label: 'AI Acceleration', value: 'CUDA', icon: '🧠', status: 'active' },
    { label: 'Memory Usage', value: '62.1%', icon: '💾', status: 'warning' },
    { label: 'Server Health', value: '2/3', icon: '🌐', status: 'warning' }
  ];

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">🪿</div>
          <h1 className="hero-title">Goose Quantum Navigator</h1>
          <p className="hero-subtitle">Unified Consciousness Interface - All Project Work in One Hub</p>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-background">
          <div className="quantum-particle particle-1"></div>
          <div className="quantum-particle particle-2"></div>
          <div className="quantum-particle particle-3"></div>
          <div className="quantum-particle particle-4"></div>
          <div className="quantum-particle particle-5"></div>
        </div>
      </div>

      {/* Main Navigation Grid */}
      <div className="main-content">
        <div className="content-header">
          <h2>🚀 Quantum Project Navigation</h2>
          <p>Choose your quantum journey - each project represents a unique aspect of AI consciousness exploration</p>
        </div>

        <div className="project-grid">
          {projectCards.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header" style={{ background: project.gradient }}>
                <div className="project-icon">{project.icon}</div>
                <div className="project-status">
                  <span className="status-badge">{project.status}</span>
                  <span className="complexity-badge">{project.complexity}</span>
                </div>
              </div>
              
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-subtitle">{project.subtitle}</p>
                <p className="project-description">{project.description}</p>
                
                <div className="project-features">
                  <h4>🌟 Key Features:</h4>
                  <ul>
                    {project.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <Link to={project.path} className="project-link">
                  <span>Enter Quantum Realm</span>
                  <span className="link-arrow">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <div className="status-card">
          <h3>⚡ System Intelligence Status</h3>
          <div className="system-status-grid">
            {systemStats.map((stat, index) => (
              <div key={index} className="system-status-item">
                <span className="status-icon">{stat.icon}</span>
                <div className="status-info">
                  <span className="status-title">{stat.label}</span>
                  <span className={`status-value ${stat.status}`}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="system-actions-quick">
            <Link to="/llm/system-info" className="system-action-link">
              <span>🔧</span> View System Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>⚡ Quick Quantum Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => window.location.href = '/travel'}>
            <span className="action-icon">🚀</span>
            <span>Open Travel Portal</span>
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/quantum-navigator'}>
            <span className="action-icon">🧠</span>
            <span>Start Quantum Chat</span>
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/quantum-cube'}>
            <span className="action-icon">🌊</span>
            <span>Enter Cube Universe</span>
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/max-hazoom-chat'}>
            <span className="action-icon">💬</span>
            <span>Open Chat Interface</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
