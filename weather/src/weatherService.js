// const API_KEY='3fb814f7b5b88598bd68557234282f10'
// const makeIconURL=(iconId)=>`https://openweathermap.org/img/wn/${iconId}@2x.png `
// const getFormattedWeatherData=async(city, units='metric')=>{
//     const URL =`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;
//     const data= await fetch(URL).then((res)=>res.json()).then((data)=>data);
//     const {weather, main:{temp, feels_like, temp_min, temp_max, pressure, humidity}, wind:{speed}, sys:{country},name}=data;
//     const {description,icon}=weather[0];
//     return{
//         description, iconURL:makeIconURL(icon), temp, feels_like, temp_min, temp_max, pressure, humidity, speed, country, name
//     };
// };
// export {getFormattedWeatherData};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const API_KEY = '3fb814f7b5b88598bd68557234282f10';

// // Make weather icon URL
// const makeIconURL = (iconId) => 
//   `https://openweathermap.org/img/wn/${iconId}@2x.png`;

// // 1. Get coordinates from city name
// const getCoordinates = async (city) => {
//   const URL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
//   const data = await fetch(URL).then((res) => res.json());
//   if (!data || data.length === 0) {
//     throw new Error("City not found");
//   }
//   return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
// };

// // 2. Get weather data using lat/lon
// const getFormattedWeatherData = async (city, units = 'metric') => {
//   const { lat, lon, name, country } = await getCoordinates(city);

//   const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
//   const data = await fetch(URL).then((res) => res.json());

//   const {
//     weather,
//     main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
//     wind: { speed },
//   } = data;

//   const { description, icon } = weather[0];

//   return {
//     description,
//     iconURL: makeIconURL(icon),
//     temp,
//     feels_like,
//     temp_min,
//     temp_max,
//     pressure,
//     humidity,
//     speed,
//     country,
//     name,
//   };
// };

// export { getFormattedWeatherData };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// src/weatherService.js
const API_KEY = import.meta.env.VITE_OWM_KEY;

// Build icon URL
export const makeIconURL = (iconId) =>
  `https://openweathermap.org/img/wn/${iconId}@2x.png`;

// ---- Geocoding ----
export async function geocodeCity(query, limit = 1) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=${limit}&appid=${API_KEY}`;
  const data = await fetch(url).then((r) => r.json());
  if (!Array.isArray(data) || data.length === 0) throw new Error("City not found");
  return data.map((d) => ({
    name: d.name,
    country: d.country,
    state: d.state,
    lat: d.lat,
    lon: d.lon,
  }));
}

// ---- Current weather by coords ----
export async function getCurrentWeatherByCoords(lat, lon, units = "metric") {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const data = await fetch(url).then((r) => r.json());
  const {
    weather,
    main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
    wind: { speed },
    sys: { country },
    name,
  } = data;
  const { description, icon } = weather[0];
  return {
    description,
    iconURL: makeIconURL(icon),
    temp,
    feels_like,
    temp_min,
    temp_max,
    pressure,
    humidity,
    speed,
    country,
    name,
  };
}

// ---- 5-day / 3-hour forecast (FREE) ----
// ---- 5-day / 3-hour forecast (FREE) ----
export async function getForecastByCoords(lat, lon, units = "metric") {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const data = await fetch(url).then((r) => r.json());

  // Next 24h strip (8 slots)
  const next8 = data.list.slice(0, 8).map((x) => ({
    dt: x.dt * 1000,
    temp: x.main.temp,
    iconURL: makeIconURL(x.weather[0].icon),
    description: x.weather[0].description,
  }));

  // Group into days
  const dailyMap = {};
  data.list.forEach((x) => {
    const date = new Date(x.dt * 1000);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!dailyMap[dayKey]) {
      dailyMap[dayKey] = {
        date: dayKey,
        temps: [],
        icons: [],
        descriptions: [],
      };
    }
    dailyMap[dayKey].temps.push(x.main.temp);
    dailyMap[dayKey].icons.push(x.weather[0].icon);
    dailyMap[dayKey].descriptions.push(x.weather[0].description);
  });

  // Build daily summaries
  const daily = Object.values(dailyMap).slice(0, 5).map((d) => {
    const min = Math.min(...d.temps);
    const max = Math.max(...d.temps);
    const icon = d.icons[Math.floor(d.icons.length / 2)]; // middle icon
    const description = d.descriptions[Math.floor(d.descriptions.length / 2)];
    return {
      date: d.date,
      min,
      max,
      iconURL: makeIconURL(icon),
      description,
    };
  });

  return { city: data.city, list: data.list, next8, daily };
}

// ---- Air Quality (FREE) ----
export async function getAirQualityByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const data = await fetch(url).then((r) => r.json());
  const aqi = data?.list?.[0]?.main?.aqi ?? null; // 1–5
  const components = data?.list?.[0]?.components ?? {};
  return { aqi, components };
}

// ---- UV index (via One Call; may require plan) ----
// If you don’t have One Call access, we’ll just return null.
export async function getUVIndexByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}`;
    const data = await fetch(url).then((r) => r.json());
    return data?.current?.uvi ?? null;
  } catch {
    return null;
  }
}

// ---- Helper: AQI label/color ----
export function aqiInfo(aqi) {
  const map = {
    1: { label: "Good", color: "#60d394" },
    2: { label: "Fair", color: "#aaf683" },
    3: { label: "Moderate", color: "#ffd97d" },
    4: { label: "Poor", color: "#ff9b85" },
    5: { label: "Very Poor", color: "#ff6b6b" },
  };
  return map[aqi] || { label: "N/A", color: "#999" };
}
