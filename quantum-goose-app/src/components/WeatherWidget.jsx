import React, { useState, useEffect } from 'react';
import { weatherService } from './WeatherService';
import './WeatherWidget.css';

const WeatherWidget = ({ location, onClose }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherService.getWeatherData(location);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
    }
  }, [location]);

  if (!location) return null;

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <div className="weather-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <h3>Weather in {location}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="current-weather">
        <div className="weather-main">
          <div className="weather-icon">{weatherData.icon}</div>
          <div className="temperature">
            <span className="temp-value">{weatherData.temp}°</span>
            <span className="temp-unit">C</span>
          </div>
        </div>
        <div className="weather-details">
          <div className="condition">{weatherData.condition}</div>
          <div className="weather-stats">
            <div className="stat">
              <span className="stat-icon">💧</span>
              <span className="stat-value">{weatherData.humidity}%</span>
            </div>
            <div className="stat">
              <span className="stat-icon">💨</span>
              <span className="stat-value">{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {weatherData.forecast && weatherData.forecast.length > 0 && (
        <div className="weather-forecast">
          <h4>5-Day Forecast</h4>
          <div className="forecast-grid">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="day-name">{day.day}</div>
                <div className="day-icon">{day.icon}</div>
                <div className="day-temps">
                  <span className="high">{day.high}°</span>
                  <span className="low">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="weather-tips">
        <h4>Travel Tips</h4>
        <div className="tips-list">
          {weatherData.temp > 30 && (
            <div className="tip hot">
              <span className="tip-icon">🌡️</span>
              <span>Stay hydrated and wear sunscreen</span>
            </div>
          )}
          {weatherData.temp < 10 && (
            <div className="tip cold">
              <span className="tip-icon">🧥</span>
              <span>Pack warm clothing</span>
            </div>
          )}
          {weatherData.humidity > 70 && (
            <div className="tip humid">
              <span className="tip-icon">💧</span>
              <span>High humidity - light breathable clothing</span>
            </div>
          )}
          {weatherData.windSpeed > 20 && (
            <div className="tip windy">
              <span className="tip-icon">💨</span>
              <span>Windy conditions - secure loose items</span>
            </div>
          )}
          {weatherData.condition.includes('Rain') && (
            <div className="tip rainy">
              <span className="tip-icon">☔</span>
              <span>Don't forget your umbrella!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;