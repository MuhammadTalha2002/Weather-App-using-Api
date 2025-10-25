import { useEffect, useMemo, useState } from "react";
import "../App.css"; // still use same CSS
import cold from "../assets/cold.jpg";
import hot from "../assets/hot.jpg";
import Description from "../components/Description";
import { FaSearch, FaStar, FaRegStar } from "react-icons/fa";
import {
  geocodeCity,
  getCurrentWeatherByCoords,
  getForecastByCoords,
  getAirQualityByCoords,
  getUVIndexByCoords,
  aqiInfo,
} from "../weatherService";

function HomePage() {
    console.log("HomePage mounted");


  const [query, setQuery] = useState("Lahore");
  const [coords, setCoords] = useState(null); // {lat, lon, name, country}
  const [unit, setUnit] = useState("metric");
  const [bg, setBg] = useState(hot);

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [uvi, setUvi] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {
      return [];
    }
  });

  // Resolve initial query → coords on mount
  useEffect(() => {
    (async () => {
      try {
        const [match] = await geocodeCity(query, 1);
        setCoords(match);
      } catch (e) {
        console.error(e);
        setCoords(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all data when coords or unit changes
  useEffect(() => {
    if (!coords) return;
    (async () => {
      try {
        const [curr, fc, air, uv] = await Promise.all([
          getCurrentWeatherByCoords(coords.lat, coords.lon, unit),
          getForecastByCoords(coords.lat, coords.lon, unit),
          getAirQualityByCoords(coords.lat, coords.lon),
          getUVIndexByCoords(coords.lat, coords.lon),
        ]);
        setCurrent(curr);
        setForecast(fc);
        setAqi(air);
        setUvi(uv);

        const threshold = unit === "metric" ? 20 : 68;
        setBg(curr.temp <= threshold ? cold : hot);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [coords, unit]);

  // Search handlers
  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const [match] = await geocodeCity(query, 1);
      setCoords(match);
    } catch (e) {
      alert("City not found");
    }
  };
  const handleEnter = (e) => e.key === "Enter" && handleSearch();

  // Unit toggle
  const toggleUnits = () => setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  // Favorites
  const isFav = useMemo(() => {
    if (!coords) return false;
    return favorites.some((f) => f.lat === coords.lat && f.lon === coords.lon);
  }, [favorites, coords]);

  const toggleFavorite = () => {
    if (!coords) return;
    let next;
    if (isFav) {
      next = favorites.filter((f) => !(f.lat === coords.lat && f.lon === coords.lon));
    } else {
      next = [{ name: coords.name, country: coords.country, lat: coords.lat, lon: coords.lon }, ...favorites].slice(0, 10);
    }
    setFavorites(next);
    localStorage.setItem("favorites", JSON.stringify(next));
  };

  function tipFor(tempC, wind, descr) {
    if (descr.includes("rain")) return "Carry an umbrella ☔";
    if (tempC <= 5) return "Bundle up — very cold 🧥";
    if (tempC <= 15) return "Light jacket recommended 🧶";
    if (tempC >= 30) return "Hydrate and wear sunscreen 🧴";
    if (wind >= 10) return "Windy — secure loose items 🌬️";
    return "Looks comfortable outside 🙂";
  }
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  
  // Example: notify if AQI poor
  useEffect(() => {
    if (aqi?.aqi >= 4 && Notification.permission === "granted") {
      new Notification("Air Quality Alert", { body: "Air quality is poor. Consider a mask." });
    }
  }, [aqi]);
  const loadFavorite = (fav) => setCoords(fav);

  return (
    <div className="app" style={{ backgroundImage: `url(${bg})` }}>
      <div className="overlay">
        <div className="container">
          {/* Search + Unit + Favorite */}
          <div className="section section__inputs">
            <div className="input-with-icon">
              <input
                type="text"
                name="city"
                placeholder="Enter city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleEnter}
              />
              <button className="search-btn" onClick={handleSearch} aria-label="Search">
                <FaSearch />
              </button>
            </div>

            <button onClick={toggleUnits}>
              {unit === "metric" ? "°F" : "°C"}
            </button>

            <button className="fav-btn" onClick={toggleFavorite} aria-label="Favorite">
              {isFav ? <FaStar /> : <FaRegStar />}
            </button>
          </div>

          {/* Quick favorites bar */}
          {favorites.length > 0 && (
            <div className="section section__favorites">
              {favorites.map((f) => (
                <button key={`${f.lat},${f.lon}`} onClick={() => loadFavorite(f)} className="pill">
                  {f.name}, {f.country}
                </button>
              ))}
            </div>
          )}

          {/* Current */}
          {current && (
            <div className="section section__temperature">
              <div className="icon">
                <h3>{`${current.name}, ${current.country}`}</h3>
                <img src={current.iconURL} alt="weather" />
                <h3>{current.description}</h3>
              </div>
              <div className="temperature">
                <h1>
                  {`${current.temp.toFixed()} °${unit === "metric" ? "C" : "F"}`}
                </h1>
              </div>
            </div>
          )}

          {/* Hourly strip (next 24h) */}
          {forecast?.next8?.length > 0 && (
            <div className="section section__strip">
              {forecast.next8.map((slot) => {
                const t = new Date(slot.dt);
                const hh = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div className="strip__cell" key={slot.dt}>
                    <div className="strip__time">{hh}</div>
                    <img src={slot.iconURL} alt="" />
                    <div className="strip__temp">{Math.round(slot.temp)}°</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AQI + UV */}
          {(aqi?.aqi || uvi !== null) && (
            <div className="section section__metrics">
              {aqi?.aqi && (() => {
                const info = aqiInfo(aqi.aqi);
                return (
                  <div className="metric aqi" style={{ borderColor: info.color }}>
                    <div className="metric__label">Air Quality</div>
                    <div className="metric__value" style={{ color: info.color }}>
                      {info.label} ({aqi.aqi})
                    </div>
                  </div>
                );
              })()}
              {uvi !== null && (
                <div className="metric uv">
                  <div className="metric__label">UV Index</div>
                  <div className="metric__value">{uvi}</div>
                </div>
              )}
            </div>
          )}
          {/* 5-Day Forecast */}
{forecast?.daily?.length > 0 && (
  <div className="section section__daily">
    {forecast.daily.map((day) => {
      const d = new Date(day.date);
      const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
      return (
        <div className="daily__cell" key={day.date}>
          <div className="daily__day">{weekday}</div>
          <img src={day.iconURL} alt={day.description} />
          <div className="daily__temp">
            {Math.round(day.min)}° / {Math.round(day.max)}°
          </div>
        </div>
      );
    })}
  </div>
)}
          {current && (
              <div className="section">
                <div>{tipFor(unit === "metric" ? current.temp : (current.temp - 32) * 5/9, current.speed, current.description)}</div>
              </div>
            )}

          {/* Bottom description cards (you already have) */}
          {current && <Description weather={current} unit={unit} />}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

