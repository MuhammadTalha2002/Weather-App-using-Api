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


const API_KEY = '3fb814f7b5b88598bd68557234282f10';

// Make weather icon URL
const makeIconURL = (iconId) => 
  `https://openweathermap.org/img/wn/${iconId}@2x.png`;

// 1. Get coordinates from city name
const getCoordinates = async (city) => {
  const URL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  const data = await fetch(URL).then((res) => res.json());
  if (!data || data.length === 0) {
    throw new Error("City not found");
  }
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
};

// 2. Get weather data using lat/lon
const getFormattedWeatherData = async (city, units = 'metric') => {
  const { lat, lon, name, country } = await getCoordinates(city);

  const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const data = await fetch(URL).then((res) => res.json());

  const {
    weather,
    main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
    wind: { speed },
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
};

export { getFormattedWeatherData };
