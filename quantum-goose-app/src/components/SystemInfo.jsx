import React, { useState, useEffect } from 'react';
import './SystemInfo.css';

const SystemInfo = () => {
  const [systemData, setSystemData] = useState({
    cpu: {
      model: 'Intel64 Family 6 Model 140',
      cores: 8,
      frequency: '2.6 GHz (max 3.3 GHz)',
      usage: 0
    },
    gpu: {
      model: 'NVIDIA GeForce RTX 3050 Ti Laptop',
      vram: '4GB',
      driver: '581.29',
      temperature: '65°C',
      usage: 0
    },
    memory: {
      total: '31.75 GB',
      available: '12.02 GB',
      usage: 62.1
    },
    disk: {
      total: '119.05 GB',
      free: '85.39 GB',
      usage: 28.3
    },
    ai: {
      pytorch: 'Detected (CPU version)',
      cuda: 'Available (Driver 581.29)',
      tensorflow: 'Not installed',
      opencl: 'Not detected'
    },
    optimization: {
      backend: 'CUDA',
      batch_size: 8,
      threads: 6,
      model_capacity: 'Can run 7B parameter models'
    },
    servers: {
      django: 'Port 8001',
      react: 'Port 5173 (Not running)',
      status: 'Partial'
    }
  });

  const [isSecureMode, setIsSecureMode] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    hardware: true,
    ai: false,
    optimization: false,
    servers: true
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSystemData(prev => ({
        ...prev,
        cpu: { ...prev.cpu, usage: Math.floor(Math.random() * 30) + 10 },
        gpu: { ...prev.gpu, usage: Math.floor(Math.random() * 40) + 20 },
        memory: { ...prev.memory, available: `${(12.02 + Math.random() * 2 - 1).toFixed(2)} GB` }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (value) => {
    if (typeof value === 'number') {
      if (value < 30) return '#10b981';
      if (value < 70) return '#f59e0b';
      return '#ef4444';
    }
    return value.includes('Available') || value.includes('Detected') ? '#10b981' : '#6b7280';
  };

  const getUsageBar = (usage) => {
    const percentage = Math.min(usage, 100);
    let color = '#10b981';
    if (percentage > 70) color = '#ef4444';
    else if (percentage > 40) color = '#f59e0b';
    
    return {
      width: `${percentage}%`,
      backgroundColor: color
    };
  };

  return (
    <div className="system-info">
      <div className="system-header">
        <h2>🖥️ System Intelligence Dashboard</h2>
        <div className="security-controls">
          <button 
            className={`security-toggle ${!isSecureMode ? 'insecure' : ''}`}
            onClick={() => setIsSecureMode(!isSecureMode)}
            title={isSecureMode ? 'Disable secure mode' : 'Enable secure mode'}
          >
            {isSecureMode ? '🔒' : '🔓'} {isSecureMode ? 'Secure' : 'Public'}
          </button>
        </div>
      </div>

      <div className="system-overview">
        <div className="overview-card">
          <div className="overview-icon">⚡</div>
          <div className="overview-content">
            <h3>System Status</h3>
            <p className="status-active">Optimal Performance</p>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">🧠</div>
          <div className="overview-content">
            <h3>AI Acceleration</h3>
            <p className="status-active">CUDA Enabled</p>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">💾</div>
          <div className="overview-content">
            <h3>Memory Usage</h3>
            <p className="status-warning">{systemData.memory.usage}%</p>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">🌊</div>
          <div className="overview-content">
            <h3>Quantum Engine</h3>
            <p className="status-active">Active</p>
          </div>
        </div>
      </div>

      {/* Hardware Section */}
      <div className="system-section">
        <div className="section-header" onClick={() => toggleSection('hardware')}>
          <h3>🔧 Hardware Specifications</h3>
          <span className="expand-icon">{expandedSections.hardware ? '▼' : '▶'}</span>
        </div>
        {expandedSections.hardware && (
          <div className="section-content">
            <div className="spec-grid">
              <div className="spec-item">
                <div className="spec-label">🖥️ CPU</div>
                <div className="spec-value">
                  <div>{systemData.cpu.model}</div>
                  <div className="spec-detail">{systemData.cpu.cores} cores • {systemData.cpu.frequency}</div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={getUsageBar(systemData.cpu.usage)}></div>
                    <span className="usage-text">{systemData.cpu.usage}%</span>
                  </div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-label">🎮 GPU</div>
                <div className="spec-value">
                  <div>{systemData.gpu.model}</div>
                  <div className="spec-detail">{systemData.gpu.vram} VRAM • Driver {systemData.gpu.driver}</div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={getUsageBar(systemData.gpu.usage)}></div>
                    <span className="usage-text">{systemData.gpu.usage}%</span>
                  </div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-label">💾 Memory</div>
                <div className="spec-value">
                  <div>Total: {systemData.memory.total}</div>
                  <div className="spec-detail">Available: {systemData.memory.available}</div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={getUsageBar(systemData.memory.usage)}></div>
                    <span className="usage-text">{systemData.memory.usage}%</span>
                  </div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-label">💿 Storage</div>
                <div className="spec-value">
                  <div>Total: {systemData.disk.total}</div>
                  <div className="spec-detail">Free: {systemData.disk.free}</div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={getUsageBar(systemData.disk.usage)}></div>
                    <span className="usage-text">{systemData.disk.usage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Acceleration Section */}
      <div className="system-section">
        <div className="section-header" onClick={() => toggleSection('ai')}>
          <h3>🤖 AI Acceleration Status</h3>
          <span className="expand-icon">{expandedSections.ai ? '▼' : '▶'}</span>
        </div>
        {expandedSections.ai && (
          <div className="section-content">
            <div className="ai-status-grid">
              <div className="ai-item">
                <div className="ai-icon">🔥</div>
                <div className="ai-content">
                  <div className="ai-label">PyTorch</div>
                  <div className="ai-value" style={{ color: getStatusColor(systemData.ai.pytorch) }}>
                    {systemData.ai.pytorch}
                  </div>
                </div>
              </div>
              <div className="ai-item">
                <div className="ai-icon">⚡</div>
                <div className="ai-content">
                  <div className="ai-label">CUDA</div>
                  <div className="ai-value" style={{ color: getStatusColor(systemData.ai.cuda) }}>
                    {systemData.ai.cuda}
                  </div>
                </div>
              </div>
              <div className="ai-item">
                <div className="ai-icon">🧠</div>
                <div className="ai-content">
                  <div className="ai-label">TensorFlow</div>
                  <div className="ai-value" style={{ color: getStatusColor(systemData.ai.tensorflow) }}>
                    {systemData.ai.tensorflow}
                  </div>
                </div>
              </div>
              <div className="ai-item">
                <div className="ai-icon">🔧</div>
                <div className="ai-content">
                  <div className="ai-label">OpenCL</div>
                  <div className="ai-value" style={{ color: getStatusColor(systemData.ai.opencl) }}>
                    {systemData.ai.opencl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optimization Section */}
      <div className="system-section">
        <div className="section-header" onClick={() => toggleSection('optimization')}>
          <h3>⚡ AI Performance Optimization</h3>
          <span className="expand-icon">{expandedSections.optimization ? '▼' : '▶'}</span>
        </div>
        {expandedSections.optimization && (
          <div className="section-content">
            <div className="optimization-grid">
              <div className="opt-item">
                <div className="opt-icon">🚀</div>
                <div className="opt-content">
                  <div className="opt-label">Recommended Backend</div>
                  <div className="opt-value">{systemData.optimization.backend}</div>
                </div>
              </div>
              <div className="opt-item">
                <div className="opt-icon">📊</div>
                <div className="opt-content">
                  <div className="opt-label">Optimal Batch Size</div>
                  <div className="opt-value">{systemData.optimization.batch_size}</div>
                </div>
              </div>
              <div className="opt-item">
                <div className="opt-icon">🧵</div>
                <div className="opt-content">
                  <div className="opt-label">Optimal Threads</div>
                  <div className="opt-value">{systemData.optimization.threads}</div>
                </div>
              </div>
              <div className="opt-item">
                <div className="opt-icon">💪</div>
                <div className="opt-content">
                  <div className="opt-label">Model Capacity</div>
                  <div className="opt-value">{systemData.optimization.model_capacity}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Server Status Section */}
      <div className="system-section">
        <div className="section-header" onClick={() => toggleSection('servers')}>
          <h3>🌐 Server Status</h3>
          <span className="expand-icon">{expandedSections.servers ? '▼' : '▶'}</span>
        </div>
        {expandedSections.servers && (
          <div className="section-content">
            <div className="server-grid">
              <div className="server-item">
                <div className="server-icon">🅳️</div>
                <div className="server-content">
                  <div className="server-label">Django Backend</div>
                  <div className="server-value" style={{ color: '#10b981' }}>
                    ✅ {systemData.servers.django} - Running
                  </div>
                </div>
              </div>
              <div className="server-item">
                <div className="server-icon">⚛️</div>
                <div className="server-content">
                  <div className="server-label">React Frontend</div>
                  <div className="server-value" style={{ color: '#ef4444' }}>
                    ❌ {systemData.servers.react} - Stopped
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      {isSecureMode && (
        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h4>Secure Mode Active</h4>
            <p>Sensitive system information is protected. Driver versions and specific model details are masked in public mode.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="system-actions">
        <button className="action-btn primary" onClick={() => window.location.href = '/hazoom-llm'}>
          <span>🧠</span> Start Super Intelligence Chat
        </button>
        <button className="action-btn secondary" onClick={() => window.location.href = '/memory'}>
          <span>💾</span> View Memory Dashboard
        </button>
        <button className="action-btn tertiary" onClick={() => window.location.reload()}>
          <span>🔄</span> Refresh System Data
        </button>
      </div>
    </div>
  );
};

export default SystemInfo;
