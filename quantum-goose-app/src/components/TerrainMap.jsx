import React, { useState, useRef, useEffect } from 'react';
import './TerrainMap.css';

const TerrainMap = ({ location, onClose, onBackToMap }) => {
  const [elevationData, setElevationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('terrain'); // terrain, satellite, hybrid
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const generateTerrainData = async () => {
      setLoading(true);
      
      // Simulate terrain data generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const terrain = {
        elevation: generateElevationGrid(),
        features: generateTerrainFeatures(),
        contours: generateContours(),
        metadata: {
          maxElevation: Math.floor(Math.random() * 3000) + 500,
          minElevation: Math.floor(Math.random() * 200),
          terrainType: getTerrainType(location)
        }
      };
      
      setElevationData(terrain);
      setLoading(false);
    };

    if (location) {
      generateTerrainData();
    }
  }, [location]);

  const generateElevationGrid = () => {
    const grid = [];
    const size = 50;
    
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        // Create realistic terrain using multiple sine waves
        const elevation = 
          Math.sin(i * 0.1) * 50 +
          Math.cos(j * 0.1) * 50 +
          Math.sin(i * 0.05 + j * 0.05) * 100 +
          Math.random() * 20;
        grid[i][j] = Math.max(0, elevation + 100);
      }
    }
    return grid;
  };

  const generateTerrainFeatures = () => {
    return [
      { type: 'mountain', x: 25, y: 25, size: 15, elevation: 2500 },
      { type: 'river', points: generateRiverPath(), width: 3 },
      { type: 'forest', x: 35, y: 40, size: 20, density: 0.8 },
      { type: 'lake', x: 15, y: 35, size: 8, depth: 50 }
    ];
  };

  const generateRiverPath = () => {
    const points = [];
    let x = 10, y = 10;
    
    for (let i = 0; i < 20; i++) {
      points.push({ x, y });
      x += Math.random() * 3 + 1;
      y += Math.random() * 2 - 1;
    }
    return points;
  };

  const generateContours = () => {
    const contours = [];
    for (let level = 200; level <= 2000; level += 200) {
      contours.push({
        elevation: level,
        points: generateContourPoints(level)
      });
    }
    return contours;
  };

  const generateContourPoints = (level) => {
    const points = [];
    const numPoints = 20;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = 10 + Math.random() * 5;
      points.push({
        x: 25 + Math.cos(angle) * radius,
        y: 25 + Math.sin(angle) * radius
      });
    }
    return points;
  };

  const getTerrainType = (location) => {
    const terrainTypes = {
      'New York': 'Coastal Urban',
      'London': 'Rolling Hills',
      'Tokyo': 'Coastal Plains',
      'Paris': 'River Valley',
      'Sydney': 'Coastal Mountains',
      'Cairo': 'Desert',
      'Rio de Janeiro': 'Coastal Mountains',
      'Moscow': 'Plains',
      'Beijing': 'Plains',
      'Mumbai': 'Coastal',
      'Cape Town': 'Coastal Mountains',
      'Toronto': 'Plains'
    };
    return terrainTypes[location] || 'Mixed Terrain';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const renderTerrain = () => {
    if (!elevationData) return null;

    const { elevation, features, contours } = elevationData;
    
    return (
      <div className="terrain-canvas" style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
        {/* Elevation grid */}
        <div className="elevation-grid">
          {elevation.map((row, i) => (
            row.map((height, j) => (
              <div
                key={`${i}-${j}`}
                className="elevation-cell"
                style={{
                  backgroundColor: getElevationColor(height),
                  left: `${j * 4}px`,
                  top: `${i * 4}px`
                }}
              />
            ))
          ))}
        </div>

        {/* Contour lines */}
        {viewMode === 'terrain' && contours.map((contour, index) => (
          <svg key={index} className="contour-layer">
            <polyline
              points={contour.points.map(p => `${p.x * 4},${p.y * 4}`).join(' ')}
              fill="none"
              stroke="rgba(139, 69, 19, 0.6)"
              strokeWidth="1"
            />
          </svg>
        ))}

        {/* Terrain features */}
        {features.map((feature, index) => (
          <div key={index} className={`terrain-feature ${feature.type}`}>
            {renderFeature(feature)}
          </div>
        ))}

        {/* Satellite overlay */}
        {viewMode === 'satellite' && (
          <div className="satellite-overlay">
            <div className="satellite-texture"></div>
          </div>
        )}

        {/* Hybrid overlay */}
        {viewMode === 'hybrid' && (
          <div className="hybrid-overlay">
            <div className="hybrid-texture"></div>
          </div>
        )}
      </div>
    );
  };

  const getElevationColor = (height) => {
    if (height < 200) return 'rgba(0, 100, 200, 0.8)'; // Water
    if (height < 400) return 'rgba(34, 139, 34, 0.8)'; // Low land
    if (height < 800) return 'rgba(107, 142, 35, 0.8)'; // Hills
    if (height < 1200) return 'rgba(160, 82, 45, 0.8)'; // Mountains
    return 'rgba(255, 255, 255, 0.9)'; // Snow peaks
  };

  const renderFeature = (feature) => {
    switch (feature.type) {
      case 'mountain':
        return (
          <div
            className="mountain"
            style={{
              left: `${feature.x * 4}px`,
              top: `${feature.y * 4}px`,
              width: `${feature.size * 4}px`,
              height: `${feature.size * 4}px`
            }}
          >
            <div className="mountain-peak"></div>
          </div>
        );
      case 'river':
        return (
          <svg className="river">
            <polyline
              points={feature.points.map(p => `${p.x * 4},${p.y * 4}`).join(' ')}
              fill="none"
              stroke="rgba(0, 100, 200, 0.8)"
              strokeWidth={feature.width}
            />
          </svg>
        );
      case 'forest':
        return (
          <div
            className="forest"
            style={{
              left: `${feature.x * 4}px`,
              top: `${feature.y * 4}px`,
              width: `${feature.size * 4}px`,
              height: `${feature.size * 4}px`
            }}
          >
            {Array.from({ length: Math.floor(feature.density * 20) }).map((_, i) => (
              <div key={i} className="tree" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}>🌲</div>
            ))}
          </div>
        );
      case 'lake':
        return (
          <div
            className="lake"
            style={{
              left: `${feature.x * 4}px`,
              top: `${feature.y * 4}px`,
              width: `${feature.size * 4}px`,
              height: `${feature.size * 4}px`
            }}
          ></div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="terrain-map loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Generating terrain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terrain-map">
      <div className="terrain-header">
        <h3>🗺️ 3D Terrain Map - {location}</h3>
        <div className="terrain-controls">
          <button className="terrain-btn back-btn" onClick={onBackToMap}>
            ← Back to Map
          </button>
          <button className="terrain-btn close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      <div className="terrain-toolbar">
        <div className="view-modes">
          <button
            className={`mode-btn ${viewMode === 'terrain' ? 'active' : ''}`}
            onClick={() => setViewMode('terrain')}
          >
            🏔️ Terrain
          </button>
          <button
            className={`mode-btn ${viewMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setViewMode('satellite')}
          >
            🛰️ Satellite
          </button>
          <button
            className={`mode-btn ${viewMode === 'hybrid' ? 'active' : ''}`}
            onClick={() => setViewMode('hybrid')}
          >
            🗺️ Hybrid
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}>
            🔍−
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}>
            🔍+
          </button>
        </div>
      </div>

      <div 
        className="terrain-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {renderTerrain()}
      </div>

      {elevationData && (
        <div className="terrain-info">
          <div className="info-panel">
            <h4>Terrain Information</h4>
            <div className="terrain-stats">
              <div className="stat">
                <span className="stat-label">Max Elevation:</span>
                <span className="stat-value">{elevationData.metadata.maxElevation}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Min Elevation:</span>
                <span className="stat-value">{elevationData.metadata.minElevation}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Terrain Type:</span>
                <span className="stat-value">{elevationData.metadata.terrainType}</span>
              </div>
            </div>
          </div>

          <div className="legend">
            <h4>Elevation Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color water"></div>
                <span>Water (0-200m)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color lowland"></div>
                <span>Lowland (200-400m)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color hills"></div>
                <span>Hills (400-800m)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color mountains"></div>
                <span>Mountains (800-1200m)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color snow"></div>
                <span>Snow (1200m+)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="terrain-instructions">
        <p>🖱️ Drag to pan • Scroll to zoom • Right-click for details</p>
      </div>
    </div>
  );
};

export default TerrainMap;