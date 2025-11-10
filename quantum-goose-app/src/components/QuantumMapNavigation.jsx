import React, { useState, useEffect } from 'react';
import './QuantumMapNavigation.css';

const QuantumMapNavigation = ({ activeSection, onSectionChange }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [animatedNodes, setAnimatedNodes] = useState(new Set());

  const quantumNodes = [
    {
      id: 'consciousness',
      title: 'Consciousness Layer',
      icon: '🧠',
      description: 'AI Mind & Intelligence',
      path: '/quantum-navigator',
      position: { x: 50, y: 15 },
      color: '#667eea',
      size: 'large',
      connections: ['memory', 'tools']
    },
    {
      id: 'quantum-cube',
      title: 'Quantum Dimension',
      icon: '🌊',
      description: '3D Universe Experience',
      path: '/quantum-cube',
      position: { x: 20, y: 35 },
      color: '#f093fb',
      size: 'medium',
      connections: ['travel', 'navigator']
    },
    {
      id: 'memory',
      title: 'Memory Matrix',
      icon: '💾',
      description: 'Persistent Memory',
      path: '/memory',
      position: { x: 75, y: 25 },
      color: '#10b981',
      size: 'medium',
      connections: ['consciousness', 'models']
    },
    {
      id: 'travel',
      title: 'Quantum Travel',
      icon: '🚀',
      description: 'Instant Navigation',
      path: '/travel',
      position: { x: 15, y: 65 },
      color: '#fee140',
      size: 'medium',
      connections: ['quantum-cube', 'models']
    },
    {
      id: 'models',
      title: 'Model Manager',
      icon: '🤖',
      description: 'AI Model Control',
      path: '/models',
      position: { x: 80, y: 55 },
      color: '#4facfe',
      size: 'small',
      connections: ['memory', 'droid']
    },
    {
      id: 'tools',
      title: 'Quantum Tools',
      icon: '🛠️',
      description: 'Available Extensions',
      action: 'tools',
      position: { x: 50, y: 45 },
      color: '#fa709a',
      size: 'small',
      connections: ['consciousness', 'droid']
    },
    {
      id: 'hazoom-llm',
      title: 'HAZoom LLM',
      icon: '⚡',
      description: 'Super Intelligence',
      path: '/hazoom-llm',
      position: { x: 30, y: 80 },
      color: '#38f9d7',
      size: 'large',
      connections: ['travel', 'tools']
    },
    {
      id: 'droid',
      title: 'HAZoom Droid',
      icon: '🤖',
      description: 'AI Assistant',
      path: '/droid',
      position: { x: 70, y: 80 },
      color: '#a78bfa',
      size: 'medium',
      connections: ['models', 'tools']
    }
  ];

  useEffect(() => {
    // Animate nodes on mount
    const timer = setTimeout(() => {
      quantumNodes.forEach((node, index) => {
        setTimeout(() => {
          setAnimatedNodes(prev => new Set([...prev, node.id]));
        }, index * 100);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleNodeClick = (node) => {
    if (node.action) {
      onSectionChange?.(node.action);
    } else if (node.path) {
      window.location.href = node.path;
    }
  };

  const getNodeClassName = (node) => {
    let classes = ['quantum-node', `node-${node.size}`];
    if (animatedNodes.has(node.id)) classes.push('animated');
    if (hoveredNode === node.id) classes.push('hovered');
    if (activeSection === node.id) classes.push('active');
    return classes.join(' ');
  };

  return (
    <div className="quantum-map-navigation">
      <div className="quantum-map-header">
        <div className="map-title">
          <span className="title-icon">🗺️</span>
          <span className="title-text">Quantum Navigator Map</span>
        </div>
        <div className="map-subtitle">Interactive Consciousness Network</div>
      </div>

      <div className="quantum-map-container">
        {/* Connection Lines */}
        <svg className="quantum-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
          {quantumNodes.map(node =>
            node.connections.map(targetId => {
              const targetNode = quantumNodes.find(n => n.id === targetId);
              if (!targetNode) return null;

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  className="connection-line"
                  style={{
                    stroke: hoveredNode === node.id || hoveredNode === targetId ? node.color : 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: hoveredNode === node.id || hoveredNode === targetId ? 0.3 : 0.15,
                  }}
                />
              );
            })
          )}
        </svg>

        {/* Quantum Nodes */}
        {quantumNodes.map(node => (
          <div
            key={node.id}
            className={getNodeClassName(node)}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
              '--node-color': node.color,
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => handleNodeClick(node)}
          >
            <div className="node-core">
              <div className="node-icon">{node.icon}</div>
              <div className="node-pulse"></div>
            </div>
            <div className="node-label">
              <div className="node-title">{node.title}</div>
              <div className="node-description">{node.description}</div>
            </div>
          </div>
        ))}

        {/* Quantum Field Background */}
        <div className="quantum-field">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="quantum-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="quantum-map-footer">
        <div className="map-stats">
          <div className="stat-item">
            <span className="stat-icon">⚛️</span>
            <span className="stat-label">Active Nodes</span>
            <span className="stat-value">{animatedNodes.size}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔗</span>
            <span className="stat-label">Connections</span>
            <span className="stat-value">
              {quantumNodes.reduce((acc, node) => acc + node.connections.length, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumMapNavigation;
