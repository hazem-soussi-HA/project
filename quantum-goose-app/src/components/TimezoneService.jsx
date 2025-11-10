// Timezone and time service for world locations
export const timezoneService = {
  getTimezoneData: (location) => {
    const timezoneData = {
      'New York': {
        timezone: 'America/New_York',
        offset: -5,
        dstOffset: -4,
        currentTime: null,
        localTime: null,
        date: null
      },
      'London': {
        timezone: 'Europe/London',
        offset: 0,
        dstOffset: 1,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Tokyo': {
        timezone: 'Asia/Tokyo',
        offset: 9,
        dstOffset: 9,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Paris': {
        timezone: 'Europe/Paris',
        offset: 1,
        dstOffset: 2,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Sydney': {
        timezone: 'Australia/Sydney',
        offset: 10,
        dstOffset: 11,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Cairo': {
        timezone: 'Africa/Cairo',
        offset: 2,
        dstOffset: 2,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Rio de Janeiro': {
        timezone: 'America/Sao_Paulo',
        offset: -3,
        dstOffset: -2,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Moscow': {
        timezone: 'Europe/Moscow',
        offset: 3,
        dstOffset: 3,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Beijing': {
        timezone: 'Asia/Shanghai',
        offset: 8,
        dstOffset: 8,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Mumbai': {
        timezone: 'Asia/Kolkata',
        offset: 5.5,
        dstOffset: 5.5,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Cape Town': {
        timezone: 'Africa/Johannesburg',
        offset: 2,
        dstOffset: 2,
        currentTime: null,
        localTime: null,
        date: null
      },
      'Toronto': {
        timezone: 'America/Toronto',
        offset: -5,
        dstOffset: -4,
        currentTime: null,
        localTime: null,
        date: null
      }
    };

    return timezoneData[location] || {
      timezone: 'UTC',
      offset: 0,
      dstOffset: 0,
      currentTime: null,
      localTime: null,
      date: null
    };
  },

  getLocalTime: (location) => {
    const data = timezoneService.getTimezoneData(location);
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * data.offset));
    
    return {
      ...data,
      currentTime: now,
      localTime: localTime,
      date: localTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      timeString: localTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      hour: localTime.getHours(),
      isDST: timezoneService.isDST(localTime, data.timezone)
    };
  },

  isDST: (date, timezone) => {
    // Simplified DST detection - in real app would use proper timezone library
    const month = date.getMonth();
    const day = date.getDate();
    
    // Northern Hemisphere DST (March to November)
    if (timezone.includes('America/') || timezone.includes('Europe/') || 
        timezone.includes('Asia/') || timezone === 'Africa/Cairo') {
      return month > 2 && month < 11;
    }
    
    // Southern Hemisphere DST (October to April)
    if (timezone.includes('Australia/')) {
      return month > 9 || month < 4;
    }
    
    return false;
  },

  getTimeDifference: (location1, location2) => {
    const data1 = timezoneService.getTimezoneData(location1);
    const data2 = timezoneService.getTimezoneData(location2);
    
    const offset1 = data1.isDST ? data1.dstOffset : data1.offset;
    const offset2 = data2.isDST ? data2.dstOffset : data2.offset;
    
    const difference = offset2 - offset1;
    
    return {
      hours: Math.floor(Math.abs(difference)),
      minutes: Math.abs(difference % 1) * 60,
      direction: difference >= 0 ? 'ahead' : 'behind',
      totalHours: difference
    };
  },

  formatTimeDifference: (location1, location2) => {
    const diff = timezoneService.getTimeDifference(location1, location2);
    
    if (diff.totalHours === 0) {
      return 'Same time zone';
    }
    
    const hours = Math.abs(diff.totalHours);
    const minutes = diff.minutes;
    
    let result = '';
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      result += `${result ? ' ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    return `${location2} is ${result} ${diff.direction} ${location1}`;
  },

  getSunTimes: (location) => {
    const data = timezoneService.getTimezoneData(location);
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * data.offset));
    
    // Simplified sunrise/sunset calculation
    const hour = localTime.getHours();
    const month = localTime.getMonth();
    
    // Approximate sunrise/sunset based on month and location
    const baseSunrise = 6; // 6 AM base
    const baseSunset = 18; // 6 PM base
    
    // Seasonal adjustment
    const seasonalAdjustment = Math.sin((month / 12) * Math.PI * 2 - Math.PI / 2) * 2;
    
    const sunrise = baseSunrise + seasonalAdjustment;
    const sunset = baseSunset - seasonalAdjustment;
    
    const isDaytime = hour >= sunrise && hour < sunset;
    
    return {
      sunrise: `${Math.floor(sunrise).toString().padStart(2, '0')}:${Math.round((sunrise % 1) * 60).toString().padStart(2, '0')}`,
      sunset: `${Math.floor(sunset).toString().padStart(2, '0')}:${Math.round((sunset % 1) * 60).toString().padStart(2, '0')}`,
      isDaytime: isDaytime,
      daylightHours: Math.round(sunset - sunrise),
      icon: isDaytime ? '☀️' : '🌙'
    };
  }
};