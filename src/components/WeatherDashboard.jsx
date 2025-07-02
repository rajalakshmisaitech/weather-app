import { Link } from 'react-router-dom';
import '../assets/css/WeatherDashboard.css';

const WeatherDashboard = ({ weatherData, loading, error }) => {
  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️'
    };
    return iconMap[weatherCode] || '🌡️';
  };

  if (loading) {
    return (
      <div className="weather-dashboard">
        <div className="loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-dashboard">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="weather-dashboard">
        <div className="welcome">
          <h2>Welcome to Weather App</h2>
          <p>Search for a city to get current weather information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-dashboard">
      <div className="weather-card">
        <div className="weather-header">
          <h2>{weatherData.name}, {weatherData.sys.country}</h2>
          <div className="weather-icon">
            {getWeatherIcon(weatherData.weather[0].icon)}
          </div>
        </div>
        
        <div className="weather-main">
          <div className="temperature">
            {Math.round(weatherData.main.temp)}°C
          </div>
          <div className="description">
            {weatherData.weather[0].description}
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span className="label">Feels like:</span>
            <span className="value">{Math.round(weatherData.main.feels_like)}°C</span>
          </div>
          <div className="detail-item">
            <span className="label">Humidity:</span>
            <span className="value">{weatherData.main.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="label">Wind:</span>
            <span className="value">{weatherData.wind.speed} m/s</span>
          </div>
          <div className="detail-item">
            <span className="label">Pressure:</span>
            <span className="value">{weatherData.main.pressure} hPa</span>
          </div>
        </div>
        
        <Link 
          to={`/detail/${weatherData.name}`} 
          className="view-forecast-btn"
        >
          View 5-Day Forecast
        </Link>
      </div>
    </div>
  );
};

export default WeatherDashboard; 