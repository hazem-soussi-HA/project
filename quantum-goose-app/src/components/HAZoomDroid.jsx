/**
 * HAZoom Droid - Intelligent System Control
 * Copyright (c) 2024 Hazem Soussi, Cloud Engineer. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import './HAZoomDroid.css';

const HAZoomDroid = () => {
  const [droidStatus, setDroidStatus] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [services, setServices] = useState({});
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const API_BASE = '/api/droid';

  useEffect(() => {
    fetchDroidStatus();
    fetchSystemInfo();
    fetchServices();

    // Set up periodic updates
    const interval = setInterval(() => {
      fetchDroidStatus();
      fetchSystemInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchDroidStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status/`);
      const data = await response.json();
      setDroidStatus(data);
    } catch (error) {
      console.error('Error fetching Droid status:', error);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/system/analyze/`);
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/services/`);
      const data = await response.json();
      setServices(data.services || {});
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleServiceAction = async (service, action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/service/action/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service, action }),
      });
      const data = await response.json();
      alert(`${action === 'start' ? 'Started' : 'Stopped'} ${service}: ${data.status || data.error}`);
      fetchServices();
      fetchDroidStatus();
    } catch (error) {
      console.error('Error with service action:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: chatQuery }),
      });
      const data = await response.json();
      setChatResponse(data.response);
      setChatHistory([...chatHistory, { query: chatQuery, response: data.response }]);
      setChatQuery('');
    } catch (error) {
      console.error('Error with chat:', error);
      setChatResponse('Error connecting to Droid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMaintenance = async () => {
    setMaintenanceActive(true);
    try {
      const response = await fetch(`${API_BASE}/maintain/`, {
        method: 'POST',
      });
      const data = await response.json();
      alert(data.message || 'Maintenance started');

      // Simulate maintenance progress
      setTimeout(() => {
        setMaintenanceActive(false);
        fetchDroidStatus();
        fetchSystemInfo();
      }, 3000);
    } catch (error) {
      console.error('Error triggering maintenance:', error);
      alert('Error: ' + error.message);
      setMaintenanceActive(false);
    }
  };

  const executeScript = async (script) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/execute_script/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script }),
      });
      const data = await response.json();
      alert(`Script ${script} executed:\nStatus: ${data.status}\nOutput: ${data.stdout || 'No output'}`);
      fetchServices();
    } catch (error) {
      console.error('Error executing script:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hazoom-droid">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="droid-header">
              <h1>
                <i className="fas fa-robot me-3"></i>
                HAZoom Droid Control Center
              </h1>
              <p className="lead">Quantum Intelligence & System Orchestration</p>
            </div>
          </div>
        </div>

        {droidStatus && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="droid-card status-card">
                <div className="card-icon">
                  <i className="fas fa-brain"></i>
                </div>
                <h3>Quantum State</h3>
                <p className="status-value">{droidStatus.quantum_consciousness?.state || 'Unknown'}</p>
                <p className="status-detail">Peace Level: {droidStatus.quantum_consciousness?.peace_level || 0}%</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="droid-card status-card">
                <div className="card-icon">
                  <i className="fas fa-server"></i>
                </div>
                <h3>Service Status</h3>
                <p className="status-value">{droidStatus.status || 'Unknown'}</p>
                <p className="status-detail">Version: {droidStatus.version || 'N/A'}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="droid-card status-card">
                <div className="card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3>Quantum Coherence</h3>
                <p className="status-value">{droidStatus.quantum_consciousness?.coherence || 0}%</p>
                <p className="status-detail">Autonomous: {droidStatus.autonomous_mode ? 'Active' : 'Standby'}</p>
              </div>
            </div>
          </div>
        )}

        {systemInfo && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="droid-card">
                <h2><i className="fas fa-desktop me-2"></i>System Monitor</h2>
                <div className="row">
                  <div className="col-md-3">
                    <div className="metric">
                      <span className="metric-label">CPU Usage</span>
                      <div className="progress">
                        <div
                          className="progress-bar bg-info"
                          style={{ width: `${systemInfo.cpu_usage || 0}%` }}
                        >
                          {systemInfo.cpu_usage || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="metric">
                      <span className="metric-label">Memory Usage</span>
                      <div className="progress">
                        <div
                          className="progress-bar bg-warning"
                          style={{ width: `${systemInfo.memory_usage || 0}%` }}
                        >
                          {systemInfo.memory_usage || 0}%
                        </div>
                      </div>
                      <small>{systemInfo.memory_available_gb || 0} GB Available</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="metric">
                      <span className="metric-label">Disk Usage</span>
                      <div className="progress">
                        <div
                          className="progress-bar bg-danger"
                          style={{ width: `${systemInfo.disk_usage || 0}%` }}
                        >
                          {systemInfo.disk_usage || 0}%
                        </div>
                      </div>
                      <small>{systemInfo.disk_free_gb || 0} GB Free</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="metric">
                      <span className="metric-label">Quantum Coherence</span>
                      <div className="progress">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${systemInfo.quantum_coherence || 0}%` }}
                        >
                          {systemInfo.quantum_coherence || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="droid-card">
              <h2><i className="fas fa-cogs me-2"></i>Service Control</h2>
              <div className="service-list">
                {Object.entries(services).map(([name, info]) => (
                  <div key={name} className="service-item">
                    <div className="service-info">
                      <h4>{name}</h4>
                      <p>{info.path}</p>
                      <span className={`badge ${info.status === 'running' ? 'bg-success' : 'bg-secondary'}`}>
                        {info.status}
                      </span>
                    </div>
                    <div className="service-actions">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleServiceAction(name, 'start')}
                        disabled={isLoading || info.status === 'running'}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleServiceAction(name, 'stop')}
                        disabled={isLoading || info.status === 'stopped'}
                      >
                        <i className="fas fa-stop"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => executeScript(name)}
                        disabled={isLoading}
                      >
                        <i className="fas fa-bolt"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="droid-card">
              <h2><i className="fas fa-comments me-2"></i>Droid AI Chat</h2>
              <div className="chat-container">
                <div className="chat-history">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                      <div className="query">Q: {msg.query}</div>
                      <div className="response">A: {msg.response}</div>
                    </div>
                  ))}
                  {chatResponse && chatHistory.length > 0 && (
                    <div className="chat-message">
                      <div className="response">A: {chatResponse}</div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleChatSubmit} className="chat-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ask the Droid anything..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="droid-card">
              <h2><i className="fas fa-magic me-2"></i>Autonomous Maintenance</h2>
              <p>Trigger quantum-optimized system maintenance and optimization</p>
              <button
                className={`btn btn-lg ${maintenanceActive ? 'btn-warning' : 'btn-success'}`}
                onClick={triggerMaintenance}
                disabled={maintenanceActive || isLoading}
              >
                {maintenanceActive ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Maintenance in Progress...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wrench me-2"></i>
                    Run Autonomous Maintenance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HAZoomDroid;
