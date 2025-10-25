import { useEffect, useState } from "react";
import {
  geocodeCity,
  getForecastByCoords,
} from "../weatherService";
import "./ForecastPage.css";

export default function ForecastPage() {
  const [query, setQuery] = useState("Lahore");
  const [coords, setCoords] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [match] = await geocodeCity(query, 1);
        setCoords(match);
      } catch (err) {
        console.error("Error fetching city:", err);
      }
    })();
  }, [query]);

  useEffect(() => {
    if (!coords) return;
    (async () => {
      try {
        const fc = await getForecastByCoords(coords.lat, coords.lon, "metric");
        setForecast(fc);
      } catch (err) {
        console.error("Error fetching forecast:", err);
      }
    })();
  }, [coords]);

  return (
    <div className="forecast-container">
      <h2>5-Day Forecast for {coords?.name}, {coords?.country}</h2>

      {forecast?.daily?.length > 0 ? (
        <div className="forecast-grid">
          {forecast.daily.map((day) => {
            const d = new Date(day.date);
            const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
            return (
              <div className="forecast-card" key={day.date}>
                <div className="day">{weekday}</div>
                <img src={day.iconURL} alt={day.description} />
                <div className="temps">
                  <span className="min">{Math.round(day.min)}°C</span>
                  <span className="max">{Math.round(day.max)}°C</span>
                </div>
                <div className="desc">{day.description}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Loading forecast...</p>
      )}
    </div>
  );
}
