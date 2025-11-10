import React, { useState, useEffect } from 'react';
import { timezoneService } from './TimezoneService';
import './TimezoneWidget.css';

const TimezoneWidget = ({ locations, currentLocation, onClose }) => {
  const [timeData, setTimeData] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTimes = () => {
      const newTimeData = {};
      locations.forEach(location => {
        newTimeData[location] = timezoneService.getLocalTime(location);
      });
      setTimeData(newTimeData);
      setCurrentTime(new Date());
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [locations]);

  const formatOffset = (offset) => {
    const sign = offset >= 0 ? '+' : '';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.abs(offset % 1) * 60;
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimeDifference = (location) => {
    if (!currentLocation || !timeData[location] || !timeData[currentLocation]) {
      return null;
    }
    return timezoneService.formatTimeDifference(currentLocation, location);
  };

  const getSunTimes = (location) => {
    return timezoneService.getSunTimes(location);
  };

  return (
    <div className="timezone-widget">
      <div className="timezone-header">
        <h3>🌍 World Clock</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="current-time-display">
        <div className="main-time">
          <span className="time-value">{currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
          })}</span>
          <span className="time-label">Your Time</span>
        </div>
        <div className="time-date">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="world-clocks">
        {locations.map(location => {
          const data = timeData[location];
          if (!data) return null;

          const sunTimes = getSunTimes(location);
          const timeDiff = getTimeDifference(location);

          return (
            <div key={location} className="clock-card">
              <div className="clock-header">
                <h4>{location}</h4>
                <span className="timezone-offset">{formatOffset(data.offset)}</span>
              </div>
              
              <div className="clock-time">
                <span className="time-display">{data.timeString}</span>
                <span className="time-icon">{sunTimes.icon}</span>
              </div>
              
              <div className="clock-date">
                {data.date}
              </div>

              <div className="clock-details">
                <div className="detail-item">
                  <span className="detail-label">Sunrise:</span>
                  <span className="detail-value">{sunTimes.sunrise}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sunset:</span>
                  <span className="detail-value">{sunTimes.sunset}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Daylight:</span>
                  <span className="detail-value">{sunTimes.daylightHours}h</span>
                </div>
              </div>

              {timeDiff && (
                <div className="time-difference">
                  <span className="diff-label">Time difference:</span>
                  <span className="diff-value">{timeDiff}</span>
                </div>
              )}

              <div className="clock-status">
                <div className={`status-indicator ${sunTimes.isDaytime ? 'day' : 'night'}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {sunTimes.isDaytime ? 'Daytime' : 'Nighttime'}
                  </span>
                </div>
                {data.isDST && (
                  <div className="dst-indicator">
                    <span className="dst-badge">DST</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="timezone-comparison">
        <h4>Quick Comparison</h4>
        <div className="comparison-grid">
          {locations.slice(0, 4).map(location => {
            const data = timeData[location];
            if (!data) return null;

            return (
              <div key={location} className="comparison-item">
                <div className="comp-location">{location}</div>
                <div className="comp-time">{data.timeString}</div>
                <div className="comp-offset">{formatOffset(data.offset)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="timezone-tips">
        <h4>Travel Tips</h4>
        <div className="tips-list">
          <div className="tip">
            <span className="tip-icon">✈️</span>
            <span>Best time to call: During overlapping business hours</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🌙</span>
            <span>Avoid jet lag: Gradually adjust sleep schedule before travel</span>
          </div>
          <div className="tip">
            <span className="tip-icon">☀️</span>
            <span>Plan activities around local daylight hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneWidget;