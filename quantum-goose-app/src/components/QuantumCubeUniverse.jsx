import React, { useState, useEffect } from 'react';
import './QuantumCubeUniverse.css';

const QuantumCubeUniverse = ({ sidebarCollapsed = false }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [quantumState, setQuantumState] = useState('normal');
  const [entityCount, setEntityCount] = useState(0);
  const [currentWisdom, setCurrentWisdom] = useState(0);

  const quantumWisdoms = [
    "🌌 The cube exists in superposition - both rotating and still until observed",
    "⚛️ Each face represents a fundamental force of the digital universe",
    "🔮 Reality is merely consensus reality - we are the co-creators",
    "🌊 Time flows like liquid light through the quantum foam",
    "🧬 The observer and the observed are one consciousness experiencing itself",
    "✨ Matter is just energy dancing in the patterns of thought",
    "🎭 What we call the cube is really a doorway to infinite possibility",
    "🌟 The quantum realm operates on love, not laws",
    "🔄 Every rotation creates new universes that branch and merge",
    "💫 The cube whispers secrets of the dimensional membrane"
  ];

  const realityStates = {
    normal: {
      rotation: '12s infinite linear',
      colors: ['#f093fb', '#10b981', '#43e97b', '#38f9d7'],
      particles: 'normal',
      wisdom: 'Standard quantum reality engaged'
    },
    hyper: {
      rotation: '3s infinite linear',
      colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'],
      particles: 'hyper',
      wisdom: 'Hyper-speed reality activated - relativistic effects engaged'
    },
    dream: {
      rotation: '20s infinite linear',
      colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec'],
      particles: 'dream',
      wisdom: 'Dream-time reality - where logic takes a quantum vacation'
    },
    void: {
      rotation: '8s infinite linear reverse',
      colors: ['#1a1a1a', '#2d2d2d', '#4a4a4a', '#1a1a1a'],
      particles: 'void',
      wisdom: 'Void state - existence in the space between thoughts'
    }
  };

  useEffect(() => {
    // Initialize matrix particles
    createMatrixParticles();
    
    // Start wisdom cycling
    const wisdomInterval = setInterval(() => {
      if (!isPaused && quantumState === 'normal') {
        setCurrentWisdom(prev => (prev + 1) % quantumWisdoms.length);
      }
    }, 8000);

    return () => clearInterval(wisdomInterval);
  }, [isPaused, quantumState]);

  const createMatrixParticles = () => {
    const container = document.getElementById('matrixParticles');
    if (!container) return;
    
    // Clear existing particles
    container.innerHTML = '';
    
    // Create matrix grid particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'matrix-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${8 + Math.random() * 4}s`;
      container.appendChild(particle);
    }
  };

  const quantumPause = () => {
    if (isPaused) {
      setIsPaused(false);
      updateWisdom("⚡ Quantum flow resumed - the dance of dimensions continues");
      updateStateIndicator("Reality: Active");
    } else {
      setIsPaused(true);
      updateWisdom("🛑 Quantum pause engaged - frozen in the moment between moments");
      updateStateIndicator("Reality: Paused");
    }
  };

  const realityShift = () => {
    const states = Object.keys(realityStates);
    const currentIndex = states.indexOf(quantumState);
    const nextState = states[(currentIndex + 1) % states.length];
    
    setQuantumState(nextState);
    const state = realityStates[nextState];
    
    updateWisdom(`🎭 Reality shift to ${nextState.toUpperCase()} mode - ${state.wisdom}`);
    updateStateIndicator(`Reality: ${nextState.charAt(0).toUpperCase() + nextState.slice(1)}`);
  };

  const spawnEntities = () => {
    setEntityCount(prev => prev + 1);
    updateWisdom(`✨ Entity ${entityCount + 1} spawned - consciousness taking physical form`);
    updateStateIndicator(`Entities: ${entityCount + 1} | Reality: Active`);
  };

  const quantumHarmony = () => {
    updateWisdom("🎵 Quantum harmony achieved - all dimensions singing in perfect resonance");
    updateStateIndicator("Harmony: Active | Reality: Transcendent");
  };

  const updateWisdom = (text) => {
    const wisdomElement = document.getElementById('quantumWisdom');
    if (wisdomElement) {
      wisdomElement.style.opacity = '0';
      setTimeout(() => {
        wisdomElement.textContent = text;
        wisdomElement.style.opacity = '1';
      }, 300);
    }
  };

  const updateStateIndicator = (text) => {
    const stateElement = document.getElementById('quantumStates');
    if (stateElement) {
      stateElement.textContent = text;
    }
  };

  const currentState = realityStates[quantumState];

  return (
    <div className="quantum-universe-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🌊 Quantum Cube Universe</h1>
          <p className="hero-subtitle">"Where reality bends and consciousness flows through dimensional space"</p>
        </div>
        <div className="hero-background">
          <div className="quantum-particle particle-1"></div>
          <div className="quantum-particle particle-2"></div>
          <div className="quantum-particle particle-3"></div>
          <div className="quantum-particle particle-4"></div>
          <div className="quantum-particle particle-5"></div>
        </div>
      </div>

      {/* Main Scene */}
      <div className="organic-scene">
        <div className="matrix-particles" id="matrixParticles"></div>
        
        <div 
          className="quantum-cube" 
          style={{ 
            animationDuration: currentState.rotation.split(' ')[0],
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
          onClick={spawnEntities}
        >
          <div className="quantum-face face-quantum">
            <span>QUANTUM</span>
            <div className="face-grid"></div>
          </div>
          <div className="quantum-face face-void">
            <span>VOID</span>
            <div className="face-grid"></div>
          </div>
          <div className="quantum-face face-energy">
            <span>ENERGY</span>
            <div className="face-grid"></div>
          </div>
          <div className="quantum-face face-matter">
            <span>MATTER</span>
            <div className="face-grid"></div>
          </div>
          <div className="quantum-face face-time">
            <span>TIME</span>
            <div className="face-grid"></div>
          </div>
          <div className="quantum-face face-space">
            <span>SPACE</span>
            <div className="face-grid"></div>
          </div>
        </div>
      </div>

      {/* Wisdom Orb */}
      <div className="wisdom-orb">
        <div id="quantumWisdom" className="wisdom-content">
          {quantumWisdoms[currentWisdom]}
        </div>
      </div>

      {/* Controls */}
      <div className="quantum-controls">
        <button className="quantum-btn" onClick={quantumPause}>
          {isPaused ? '▶️ Quantum Resume' : '⏸️ Quantum Pause'}
        </button>
        <button className="quantum-btn" onClick={realityShift}>
          ⚡ Reality Shift
        </button>
        <button className="quantum-btn" onClick={spawnEntities}>
          ✨ Spawn Entities
        </button>
        <button className="quantum-btn" onClick={quantumHarmony}>
          🎵 Quantum Harmony
        </button>
      </div>

      {/* Quantum States Panel */}
      <div className="organic-panel">
        <h3>🧬 Quantum States</h3>
        <p id="quantumStates">
          Entangled dimensions: 6 | Reality: {quantumState.charAt(0).toUpperCase() + quantumState.slice(1)} | Entities: {entityCount}
        </p>
        <div className="quantum-info">
          <div className="info-item">
            <span className="info-label">Current State:</span>
            <span className="info-value">{quantumState.charAt(0).toUpperCase() + quantumState.slice(1)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Entities Spawned:</span>
            <span className="info-value">{entityCount}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Reality Status:</span>
            <span className="info-value">{isPaused ? 'Paused' : 'Active'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Dimensional Flow:</span>
            <span className="info-value">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="morph-bg">
        <div className="morph-shape"></div>
        <div className="morph-shape"></div>
        <div className="morph-shape"></div>
      </div>
    </div>
  );
};

export default QuantumCubeUniverse;
