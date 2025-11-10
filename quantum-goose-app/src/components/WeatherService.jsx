// Mock weather service for demonstration
export const weatherService = {
  getWeatherData: async (location) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock weather data based on location
    const weatherData = {
      'New York': {
        temp: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: '⛅',
        forecast: [
          { day: 'Mon', high: 24, low: 18, icon: '☀️' },
          { day: 'Tue', high: 22, low: 16, icon: '⛅' },
          { day: 'Wed', high: 20, low: 14, icon: '🌧️' },
          { day: 'Thu', high: 23, low: 17, icon: '⛅' },
          { day: 'Fri', high: 25, low: 19, icon: '☀️' }
        ]
      },
      'London': {
        temp: 18,
        condition: 'Rainy',
        humidity: 80,
        windSpeed: 18,
        icon: '🌧️',
        forecast: [
          { day: 'Mon', high: 19, low: 14, icon: '🌧️' },
          { day: 'Tue', high: 17, low: 12, icon: '☁️' },
          { day: 'Wed', high: 16, low: 11, icon: '🌧️' },
          { day: 'Thu', high: 18, low: 13, icon: '⛅' },
          { day: 'Fri', high: 20, low: 15, icon: '☀️' }
        ]
      },
      'Tokyo': {
        temp: 26,
        condition: 'Clear',
        humidity: 55,
        windSpeed: 8,
        icon: '☀️',
        forecast: [
          { day: 'Mon', high: 28, low: 22, icon: '☀️' },
          { day: 'Tue', high: 27, low: 21, icon: '⛅' },
          { day: 'Wed', high: 25, low: 19, icon: '🌧️' },
          { day: 'Thu', high: 26, low: 20, icon: '⛅' },
          { day: 'Fri', high: 29, low: 23, icon: '☀️' }
        ]
      },
      'Paris': {
        temp: 20,
        condition: 'Partly Cloudy',
        humidity: 60,
        windSpeed: 10,
        icon: '⛅',
        forecast: [
          { day: 'Mon', high: 22, low: 16, icon: '⛅' },
          { day: 'Tue', high: 21, low: 15, icon: '☀️' },
          { day: 'Wed', high: 19, low: 13, icon: '🌧️' },
          { day: 'Thu', high: 20, low: 14, icon: '☁️' },
          { day: 'Fri', high: 23, low: 17, icon: '☀️' }
        ]
      },
      'Sydney': {
        temp: 24,
        condition: 'Sunny',
        humidity: 50,
        windSpeed: 15,
        icon: '☀️',
        forecast: [
          { day: 'Mon', high: 26, low: 20, icon: '☀️' },
          { day: 'Tue', high: 25, low: 19, icon: '⛅' },
          { day: 'Wed', high: 23, low: 17, icon: '🌧️' },
          { day: 'Thu', high: 24, low: 18, icon: '⛅' },
          { day: 'Fri', high: 27, low: 21, icon: '☀️' }
        ]
      },
      'Cairo': {
        temp: 35,
        condition: 'Hot & Clear',
        humidity: 25,
        windSpeed: 5,
        icon: '🌞',
        forecast: [
          { day: 'Mon', high: 37, low: 28, icon: '☀️' },
          { day: 'Tue', high: 36, low: 27, icon: '☀️' },
          { day: 'Wed', high: 35, low: 26, icon: '⛅' },
          { day: 'Thu', high: 34, low: 25, icon: '☀️' },
          { day: 'Fri', high: 38, low: 29, icon: '🌞' }
        ]
      },
      'Rio de Janeiro': {
        temp: 28,
        condition: 'Tropical',
        humidity: 75,
        windSpeed: 20,
        icon: '🌴',
        forecast: [
          { day: 'Mon', high: 30, low: 24, icon: '⛅' },
          { day: 'Tue', high: 29, low: 23, icon: '🌧️' },
          { day: 'Wed', high: 28, low: 22, icon: '⛈️' },
          { day: 'Thu', high: 29, low: 23, icon: '⛅' },
          { day: 'Fri', high: 31, low: 25, icon: '☀️' }
        ]
      },
      'Moscow': {
        temp: 15,
        condition: 'Cloudy',
        humidity: 70,
        windSpeed: 14,
        icon: '☁️',
        forecast: [
          { day: 'Mon', high: 17, low: 10, icon: '☁️' },
          { day: 'Tue', high: 16, low: 9, icon: '🌧️' },
          { day: 'Wed', high: 14, low: 7, icon: '❄️' },
          { day: 'Thu', high: 15, low: 8, icon: '☁️' },
          { day: 'Fri', high: 18, low: 11, icon: '⛅' }
        ]
      },
      'Beijing': {
        temp: 23,
        condition: 'Hazy',
        humidity: 45,
        windSpeed: 6,
        icon: '🌫️',
        forecast: [
          { day: 'Mon', high: 25, low: 18, icon: '🌫️' },
          { day: 'Tue', high: 24, low: 17, icon: '⛅' },
          { day: 'Wed', high: 22, low: 15, icon: '🌧️' },
          { day: 'Thu', high: 23, low: 16, icon: '🌫️' },
          { day: 'Fri', high: 26, low: 19, icon: '☀️' }
        ]
      },
      'Mumbai': {
        temp: 32,
        condition: 'Humid',
        humidity: 85,
        windSpeed: 12,
        icon: '🌧️',
        forecast: [
          { day: 'Mon', high: 34, low: 28, icon: '🌧️' },
          { day: 'Tue', high: 33, low: 27, icon: '⛈️' },
          { day: 'Wed', high: 32, low: 26, icon: '🌧️' },
          { day: 'Thu', high: 33, low: 27, icon: '⛅' },
          { day: 'Fri', high: 35, low: 29, icon: '☀️' }
        ]
      },
      'Cape Town': {
        temp: 21,
        condition: 'Windy',
        humidity: 40,
        windSpeed: 25,
        icon: '💨',
        forecast: [
          { day: 'Mon', high: 23, low: 16, icon: '💨' },
          { day: 'Tue', high: 22, low: 15, icon: '⛅' },
          { day: 'Wed', high: 20, low: 13, icon: '🌧️' },
          { day: 'Thu', high: 21, low: 14, icon: '💨' },
          { day: 'Fri', high: 24, low: 17, icon: '☀️' }
        ]
      },
      'Toronto': {
        temp: 19,
        condition: 'Mild',
        humidity: 55,
        windSpeed: 11,
        icon: '🌤️',
        forecast: [
          { day: 'Mon', high: 21, low: 14, icon: '🌤️' },
          { day: 'Tue', high: 20, low: 13, icon: '⛅' },
          { day: 'Wed', high: 18, low: 11, icon: '🌧️' },
          { day: 'Thu', high: 19, low: 12, icon: '🌤️' },
          { day: 'Fri', high: 22, low: 15, icon: '☀️' }
        ]
      }
    };

    return weatherData[location] || {
      temp: 20,
      condition: 'Unknown',
      humidity: 50,
      windSpeed: 10,
      icon: '❓',
      forecast: []
    };
  }
};