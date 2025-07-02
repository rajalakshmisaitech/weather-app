import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import WeatherDashboard from './components/WeatherDashboard';
import WeatherDetail from './components/WeatherDetail';
import SearchBar from './components/SearchBar';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching weather for:', city);
      
      // First, get coordinates for the city using geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      
      const geoData = await geoResponse.json();
      console.log('Geocoding Response:', geoData);
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }
      
      const { latitude, longitude } = geoData.results[0];
      
      // Get current weather using coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl&timezone=auto`
      );
      
      const weatherData = await weatherResponse.json();
      console.log('Weather Response:', weatherData);
      
      if (weatherData.error) {
        throw new Error(weatherData.reason || 'Weather data not available');
      }
      
      // Transform OpenMeteo data to match our component expectations
      const transformedData = {
        name: geoData.results[0].name,
        sys: { country: geoData.results[0].country },
        main: {
          temp: weatherData.current.temperature_2m,
          feels_like: weatherData.current.apparent_temperature,
          humidity: weatherData.current.relative_humidity_2m,
          pressure: weatherData.current.pressure_msl
        },
        weather: [{
          description: getWeatherDescription(weatherData.current.weather_code),
          icon: getWeatherIcon(weatherData.current.weather_code)
        }],
        wind: {
          speed: weatherData.current.wind_speed_10m
        }
      };
      
      setWeatherData(transformedData);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async (city) => {
    try {
      // First, get coordinates for the city
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }
      
      const { latitude, longitude } = geoData.results[0];
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      
      const forecastData = await forecastResponse.json();
      
      if (forecastData.error) {
        throw new Error(forecastData.reason || 'Forecast data not available');
      }
      
      // Transform forecast data to match our component expectations
      // Limit to 5 days (120 hours) of data
      const limitedData = forecastData.hourly.time.slice(0, 120);
      
      const transformedData = {
        list: limitedData.map((time, index) => ({
          dt: new Date(time).getTime() / 1000,
          main: {
            temp: forecastData.hourly.temperature_2m[index],
            humidity: forecastData.hourly.relative_humidity_2m[index]
          },
          weather: [{
            description: getWeatherDescription(forecastData.hourly.weather_code[index]),
            icon: getWeatherIcon(forecastData.hourly.weather_code[index])
          }],
          wind: {
            speed: forecastData.hourly.wind_speed_10m[index]
          }
        }))
      };
      
      return transformedData;
    } catch (err) {
      throw err;
    }
  };

  // Helper functions for weather codes
  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  };

  const getWeatherIcon = (code) => {
    const icons = {
      0: '01d', // Clear sky
      1: '02d', // Mainly clear
      2: '03d', // Partly cloudy
      3: '04d', // Overcast
      45: '50d', // Foggy
      48: '50d', // Depositing rime fog
      51: '09d', // Light drizzle
      53: '09d', // Moderate drizzle
      55: '09d', // Dense drizzle
      61: '10d', // Slight rain
      63: '10d', // Moderate rain
      65: '10d', // Heavy rain
      71: '13d', // Slight snow
      73: '13d', // Moderate snow
      75: '13d', // Heavy snow
      77: '13d', // Snow grains
      80: '09d', // Slight rain showers
      81: '09d', // Moderate rain showers
      82: '09d', // Violent rain showers
      85: '13d', // Slight snow showers
      86: '13d', // Heavy snow showers
      95: '11d', // Thunderstorm
      96: '11d', // Thunderstorm with slight hail
      99: '11d'  // Thunderstorm with heavy hail
    };
    return icons[code] || '01d';
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Weather App</h1>
        </header>
        
        <main>
          <div className="search-container">
            <SearchBar onSearch={fetchWeatherData} />
          </div>

          <Routes>
            <Route 
              path="/" 
              element={
                <WeatherDashboard 
                  weatherData={weatherData}
                  loading={loading}
                  error={error}
                  onSearch={fetchWeatherData}
                />
              } 
            />
            <Route 
              path="/detail/:city" 
              element={
                <WeatherDetail 
                  fetchForecastData={fetchForecastData}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
