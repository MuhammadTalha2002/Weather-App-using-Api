import { useEffect, useState } from 'react';
import './App.css'; 
import cold from './assets/cold.jpg';
import hot from './assets/hot.jpg';
import Description from './components/Description';
import { getFormattedWeatherData } from './weatherService';
//import Navbar from './components/Navbar';
function App() {
  const [city, setCity]=useState('Lahore');
  const [weather, setWeather]=useState(null);
  const [unit, setUnits]=useState('metric');
  const [bg, setBg]=useState(hot);
  useEffect(()=>{
    const fetchWeatherData = async () => {
    const data = await getFormattedWeatherData(city,unit);
    setWeather(data);

    //for dynamic Background I am setting a threshhold
    const threshold = unit === 'metric' ? 20 : 68;
    if(data.temp<=threshold) setBg(cold);
    else setBg(hot);
    };

    fetchWeatherData();
  },[unit,city]);

  const handleUnitsClick = (e) =>{
     const button=e.currentTarget;
     const currentUnit= button.innerText.slice(1);

     const isCelsius = currentUnit ==='C';
     button.innerText = isCelsius ? '°F' : '°C';
     setUnits(isCelsius ? 'metric' : 'imperial');
  }

  const enterKeyPressed=(e)=>{
    if (e.keyCode===13){
      setCity(e.currentTarget.value);
      e.currentTarget.blur();
    }
  }

  return (
    <div className='app' style={{backgroundImage: `url(${bg})`}}>
     <div className="overlay">
      {
        weather &&(
          
        <div className="container">
        <div className="section section__inputs">
          <input onKeyDown={enterKeyPressed} type="text" name="city" placeholder="enter city..."/>
          <button onClick={(e)=>{handleUnitsClick(e)}}> °F</button>
        </div>
        <div className="section section__temperature">
            <div className="icon">
              <h3>{`${weather.name},${weather.country}`}</h3>
              <img src={weather.iconURL} alt="weathericon" />
              <h3>{`${weather.description}`}</h3>
            </div>
            <div className="temperature">
              <h1> {`${weather.temp.toFixed()} °${unit==='metric'?'C':'F'}`}</h1>
            </div>
        </div>
        {/*bottom description*/}
        <Description weather={weather} unit={unit}/>
      </div>
        )
      }
     </div>
    </div>
  );
}

export default App;
