import React, { useState, useRef, useEffect } from 'react';
import './WorldMapRouter.css';
import WeatherWidget from './WeatherWidget';
import TerrainMap from './TerrainMap';
import TimezoneWidget from './TimezoneWidget';

const WorldMapRouter = ({ onRouteComplete, onBackToEarth }) => {
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [route, setRoute] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [travelProgress, setTravelProgress] = useState(0);
  const [isTraveling, setIsTraveling] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [showWeather, setShowWeather] = useState(null);
  const [showTerrain, setShowTerrain] = useState(null);
  const [showTimezone, setShowTimezone] = useState(false);
  const mapRef = useRef(null);

  const locations = [
    { id: 1, name: "New York", lat: 40.7128, lng: -74.0060, country: "USA", icon: "🗽" },
    { id: 2, name: "London", lat: 51.5074, lng: -0.1278, country: "UK", icon: "🇬🇧" },
    { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan", icon: "🗾" },
    { id: 4, name: "Paris", lat: 48.8566, lng: 2.3522, country: "France", icon: "🗼" },
    { id: 5, name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia", icon: "🦘" },
    { id: 6, name: "Cairo", lat: 30.0444, lng: 31.2357, country: "Egypt", icon: "🐪" },
    { id: 7, name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, country: "Brazil", icon: "🏖️" },
    { id: 8, name: "Moscow", lat: 55.7558, lng: 37.6173, country: "Russia", icon: "🇷🇺" },
    { id: 9, name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China", icon: "🏯" },
    { id: 10, name: "Mumbai", lat: 19.0760, lng: 72.8777, country: "India", icon: "🕌" },
    { id: 11, name: "Cape Town", lat: -33.9249, lng: 18.4241, country: "South Africa", icon: "🦁" },
    { id: 12, name: "Toronto", lat: 43.6532, lng: -79.3832, country: "Canada", icon: "🍁" }
  ];

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateRoute = () => {
    if (!selectedStart || !selectedEnd) return;
    
    setIsRouting(true);
    
    setTimeout(() => {
      const distance = calculateDistance(
        selectedStart.lat, selectedStart.lng,
        selectedEnd.lat, selectedEnd.lng
      );
      
      const waypoints = generateWaypoints(selectedStart, selectedEnd);
      
      setRoute({
        start: selectedStart,
        end: selectedEnd,
        distance: Math.round(distance),
        waypoints: waypoints,
        estimatedTime: Math.round(distance / 900) // Assuming 900 km/h average speed
      });
      
      setIsRouting(false);
      setShowRouteInfo(true);
    }, 1500);
  };

  const generateWaypoints = (start, end) => {
    const waypoints = [];
    const steps = 5;
    
    for (let i = 1; i < steps; i++) {
      const lat = start.lat + (end.lat - start.lat) * (i / steps);
      const lng = start.lng + (end.lng - start.lng) * (i / steps);
      waypoints.push({
        lat: lat,
        lng: lng,
        name: `Waypoint ${i}`
      });
    }
    
    return waypoints;
  };

  const startTravel = () => {
    if (!route) return;
    
    setIsTraveling(true);
    setTravelProgress(0);
    
    const travelInterval = setInterval(() => {
      setTravelProgress(prev => {
        if (prev >= 100) {
          clearInterval(travelInterval);
          setIsTraveling(false);
          setTimeout(() => {
            alert(`Arrived at ${route.end.name}!`);
            onRouteComplete && onRouteComplete(route.end);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleLocationClick = (location) => {
    if (!selectedStart) {
      setSelectedStart(location);
    } else if (!selectedEnd && location.id !== selectedStart.id) {
      setSelectedEnd(location);
    } else {
      setSelectedStart(location);
      setSelectedEnd(null);
      setRoute(null);
      setShowRouteInfo(false);
    }
  };

  const handleLocationRightClick = (e, location) => {
    e.preventDefault();
    setShowWeather(location.name);
  };

  const handleLocationDoubleClick = (location) => {
    setShowTerrain(location.name);
  };

  const resetRoute = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setRoute(null);
    setShowRouteInfo(false);
    setTravelProgress(0);
    setIsTraveling(false);
  };

  const latToY = (lat) => {
    return ((90 - lat) / 180) * 100;
  };

  const lngToX = (lng) => {
    return ((lng + 180) / 360) * 100;
  };

  return (
    <div className="world-map-router">
      <div className="map-header">
        <h2>🗺️ World Route Planner</h2>
        <div className="map-controls">
          <button className="map-btn back-btn" onClick={onBackToEarth}>
            ← Back to Earth
          </button>
          <button className="map-btn timezone-btn" onClick={() => setShowTimezone(!showTimezone)}>
            🌍 World Clock
          </button>
          <button className="map-btn reset-btn" onClick={resetRoute}>
            🔄 Reset Route
          </button>
        </div>
      </div>

      <div className="map-container">
        <div className="world-map" ref={mapRef}>
          <div className="map-background">
            <div className="continent continent-north-america"></div>
            <div className="continent continent-south-america"></div>
            <div className="continent continent-europe"></div>
            <div className="continent continent-africa"></div>
            <div className="continent continent-asia"></div>
            <div className="continent continent-oceania"></div>
          </div>

          {locations.map(location => (
            <div
              key={location.id}
              className={`location-marker ${
                selectedStart?.id === location.id ? 'start' : 
                selectedEnd?.id === location.id ? 'end' : ''
              }`}
              style={{
                left: `${lngToX(location.lng)}%`,
                top: `${latToY(location.lat)}%`
              }}
              onClick={() => handleLocationClick(location)}
              onContextMenu={(e) => handleLocationRightClick(e, location)}
              onDoubleClick={() => handleLocationDoubleClick(location)}
            >
              <div className="marker-icon">{location.icon}</div>
              <div className="marker-label">
                <div className="location-name">{location.name}</div>
                <div className="location-country">{location.country}</div>
              </div>
            </div>
          ))}

          {route && (
            <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={`M ${lngToX(route.start.lng)} ${latToY(route.start.lat)} 
                    ${route.waypoints.map(wp => `L ${lngToX(wp.lng)} ${latToY(wp.lat)}`).join(' ')} 
                    L ${lngToX(route.end.lng)} ${latToY(route.end.lat)}`}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="0.5"
                strokeDasharray={isTraveling ? "2,2" : "0"}
              />
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4169E1" />
                  <stop offset="100%" stopColor="#ff6496" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {isTraveling && (
            <div
              className="travel-marker"
              style={{
                left: `${lngToX(
                  route.start.lng + (route.end.lng - route.start.lng) * (travelProgress / 100)
                )}%`,
                top: `${latToY(
                  route.start.lat + (route.end.lat - route.start.lat) * (travelProgress / 100)
                )}%`
              }}
            >
              ✈️
            </div>
          )}
        </div>

        <div className="route-panel">
          <div className="route-selection">
            <h3>Route Selection</h3>
            <div className="selection-info">
              <div className="selection-item">
                <span className="label">Start:</span>
                <span className="value">
                  {selectedStart ? `${selectedStart.icon} ${selectedStart.name}` : "Click on map"}
                </span>
              </div>
              <div className="selection-item">
                <span className="label">End:</span>
                <span className="value">
                  {selectedEnd ? `${selectedEnd.icon} ${selectedEnd.name}` : "Click on map"}
                </span>
              </div>
            </div>
            
            <button 
              className="route-btn calculate-btn"
              onClick={calculateRoute}
              disabled={!selectedStart || !selectedEnd || isRouting}
            >
              {isRouting ? '🔄 Calculating...' : '🧭 Calculate Route'}
            </button>
          </div>

          {showRouteInfo && route && (
            <div className="route-info">
              <h3>Route Information</h3>
              <div className="route-stats">
                <div className="stat-item">
                  <span className="stat-label">Distance:</span>
                  <span className="stat-value">{route.distance.toLocaleString()} km</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Est. Time:</span>
                  <span className="stat-value">{route.estimatedTime} hours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Waypoints:</span>
                  <span className="stat-value">{route.waypoints.length}</span>
                </div>
              </div>
              
              <div className="route-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${travelProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {isTraveling ? `Traveling: ${Math.round(travelProgress)}%` : 'Ready to travel'}
                </span>
              </div>
              
              <button 
                className="route-btn travel-btn"
                onClick={startTravel}
                disabled={isTraveling}
              >
                {isTraveling ? '✈️ Traveling...' : '🚀 Start Travel'}
              </button>
            </div>
          )}

          <div className="locations-list">
            <h3>Available Locations</h3>
            <div className="locations-grid">
              {locations.map(location => (
                <div
                  key={location.id}
                  className={`location-card ${
                    selectedStart?.id === location.id ? 'selected-start' :
                    selectedEnd?.id === location.id ? 'selected-end' : ''
                  }`}
                  onClick={() => handleLocationClick(location)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowWeather(location.name);
                  }}
                  onDoubleClick={() => handleLocationDoubleClick(location)}
                >
                  <div className="card-icon">{location.icon}</div>
                  <div className="card-info">
                    <div className="card-name">{location.name}</div>
                    <div className="card-country">{location.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showWeather && (
        <WeatherWidget 
          location={showWeather} 
          onClose={() => setShowWeather(null)} 
        />
      )}

      {showTerrain && (
        <TerrainMap 
          location={showTerrain}
          onClose={() => setShowTerrain(null)}
          onBackToMap={() => setShowTerrain(null)}
        />
      )}

      {showTimezone && (
        <TimezoneWidget 
          locations={locations.map(loc => loc.name)}
          currentLocation={selectedEnd?.name || selectedStart?.name}
          onClose={() => setShowTimezone(false)}
        />
      )}
    </div>
  );
};

export default WorldMapRouter;