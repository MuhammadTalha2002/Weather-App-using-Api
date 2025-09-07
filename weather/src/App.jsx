import { useEffect, useState } from 'react';
import './App.css'; 
import cold from './assets/cold.jpg';
import hot from './assets/hot.jpg';
import Description from './components/Description';
import { getFormattedWeatherData } from './weatherService';
import { FaSearch } from "react-icons/fa";


function App() {
  const [city, setCity] = useState('Lahore');
  const [query, setQuery] = useState('Lahore'); // input box value
  const [weather, setWeather] = useState(null);
  const [unit, setUnits] = useState('metric');
  const [bg, setBg] = useState(hot);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getFormattedWeatherData(city, unit);
        setWeather(data);

        // background change
        const threshold = unit === 'metric' ? 20 : 68;
        if (data.temp <= threshold) setBg(cold);
        else setBg(hot);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchWeatherData();
  }, [unit, city]);

  const handleUnitsClick = (e) => {
    const button = e.currentTarget;
    const currentUnit = button.innerText.slice(1);
    const isCelsius = currentUnit === 'C';
    button.innerText = isCelsius ? '°F' : '°C';
    setUnits(isCelsius ? 'metric' : 'imperial');
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      setCity(query);
    }
  };

  const enterKeyPressed = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='app' style={{ backgroundImage: `url(${bg})` }}>
      <div className="overlay">
        {weather && (
          <div className="container">
            <div className="section section__inputs">
              <div className="input-with-icon">
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={enterKeyPressed}
                />
                <button className="search-btn" onClick={handleSearch}>
                  <FaSearch/>
                </button>
              </div>
              <button onClick={handleUnitsClick}>°F</button>
            </div>

            <div className="section section__temperature">
              <div className="icon">
                <h3>{`${weather.name}, ${weather.country}`}</h3>
                <img src={weather.iconURL} alt="weather icon" />
                <h3>{weather.description}</h3>
              </div>
              <div className="temperature">
                <h1>{`${weather.temp.toFixed()} °${unit === 'metric' ? 'C' : 'F'}`}</h1>
              </div>
            </div>

            {/* bottom description */}
            <Description weather={weather} units={unit} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
