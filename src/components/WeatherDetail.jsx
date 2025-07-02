import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../assets/css/WeatherDetail.css';

const WeatherDetail = ({ fetchForecastData }) => {
  const { city } = useParams();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getForecast = async () => {
      try {
        setLoading(true);
        const data = await fetchForecastData(city);
        setForecastData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getForecast();
  }, [city, fetchForecastData]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group forecast data by day
  const groupForecastByDay = (data) => {
    const grouped = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="weather-detail">
        <div className="loading">Loading forecast data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-detail">
        <div className="error">Error: {error}</div>
        <Link to="/" className="back-btn">Back to Dashboard</Link>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="weather-detail">
        <div className="error">No forecast data available</div>
        <Link to="/" className="back-btn">Back to Dashboard</Link>
      </div>
    );
  }

  const groupedForecast = groupForecastByDay(forecastData);

  return (
    <div className="weather-detail">
      <div className="detail-header">
        <h2>5-Day Forecast for {city}</h2>
        <Link to="/" className="back-btn">← Back to Dashboard</Link>
      </div>

      <div className="forecast-container">
        {Object.entries(groupedForecast).map(([date, forecasts]) => (
          <div key={date} className="forecase-details">
            <div className="forecast-date">
              <h3>{formatDate(date)}</h3>
            </div>
            <div className="forecast-day">
              {/* <div className="forecast-date">
              <h3>{formatDate(date)}</h3>
            </div> */}
              <div className="forecast-items">
                {forecasts.map((forecast, index) => (
                  <div key={index} className="forecast-item">
                    <div className="forecast-time">
                      {formatTime(forecast.dt * 1000)}
                    </div>
                    <div className="forecast-icon">
                      {getWeatherIcon(forecast.weather[0].icon)}
                    </div>
                    <div className="forecast-temp">
                      {Math.round(forecast.main.temp)}°C
                    </div>
                    <div className="forecast-desc">
                      {forecast.weather[0].description}
                    </div>
                    <div className="forecast-details">
                      <span>💧 {forecast.main.humidity}%</span>
                      <span>💨 {forecast.wind.speed} m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherDetail; 