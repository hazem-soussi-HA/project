import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse?.(newCollapsedState);
  };

  const navItems = [
    {
      path: '/',
      title: 'Dashboard',
      icon: '🏠',
      description: 'Main Hub'
    },
    {
      path: '/travel',
      title: 'Quantum Travel',
      icon: '🚀',
      description: 'Instant Navigation Portal'
    },
    {
      path: '/quantum-navigator',
      title: 'Quantum Navigator',
      icon: '🧠',
      description: 'AI Chat with Mini-Max Theory'
    },
    {
      path: '/quantum-cube',
      title: 'Quantum Cube Universe',
      icon: '🌊',
      description: 'Pure Quantum Experience'
    },
    {
      path: '/max-hazoom-chat',
      title: 'Max Hazoom Chat',
      icon: '💬',
      description: 'Original Chat Interface'
    },
    {
      path: '/legacy-cube',
      title: 'Legacy 3D Cube',
      icon: '🎲',
      description: 'Legacy 3D Experience'
    }
  ];

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <span className={isCollapsed ? 'hamburger active' : 'hamburger'}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      
      <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="navbar-header">
          <div className="logo-section">
            <div className="quantum-goose-icon">🪿</div>
            <div className="logo-text">
              <h2>Goose Quantum</h2>
              <p>Navigator Hub</p>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>System Online</span>
          </div>
        </div>

        <div className="nav-sections">
          <div className="nav-section">
            <h3 className="nav-section-title">🚀 Navigation</h3>
            <div className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-content">
                    <span className="nav-title">{item.title}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">⚡ Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => window.location.href = '/quantum-navigator'}>
                <span className="action-icon">🔬</span>
                <span>Quantum Science</span>
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/quantum-cube'}>
                <span className="action-icon">🎨</span>
                <span>Cube Experience</span>
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/quantum-navigator'}>
                <span className="action-icon">🧠</span>
                <span>AI Chat</span>
              </button>
            </div>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">⚙️ System</h3>
            <div className="system-controls">
              <button className="control-btn" onClick={() => window.location.reload()}>
                <span className="control-icon">🔄</span>
                <span>Reload System</span>
              </button>
              <button className="control-btn" onClick={() => alert('Export functionality coming soon!')}>
                <span className="control-icon">💾</span>
                <span>Export Data</span>
              </button>
              <button className="control-btn" onClick={() => alert('Settings functionality coming soon!')}>
                <span className="control-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        <div className="navbar-footer">
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Quantum States:</span>
              <span className="info-value">6</span>
            </div>
            <div className="info-item">
              <span className="info-label">Reality:</span>
              <span className="info-value">Stable</span>
            </div>
            <div className="info-item">
              <span className="info-label">Consciousness:</span>
              <span className="info-value">Active</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
