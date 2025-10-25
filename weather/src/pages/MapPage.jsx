// import { MapContainer, TileLayer } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// const API_KEY = import.meta.env.VITE_OWM_KEY;

// export default function MapPage() {
//   return (
//     <div style={{ height: "100vh", width: "100%" }}>
//       <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
//         {/* Base map (OpenStreetMap) */}
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; OpenStreetMap contributors"
//         />

//         {/* Clouds layer */}
//         <TileLayer
//           url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
//           attribution="&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>"
//         />

//         {/* Rain/precipitation layer */}
//         <TileLayer
//           url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
//           attribution="&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>"
//         />
//       </MapContainer>
//     </div>
//   );
// }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-control-geocoder/dist/Control.Geocoder.css"; // ✅ Keep the CSS
// import "leaflet-control-geocoder"; // ✅ Import only the package (no dist path)
// import "./MapPage.css";

// export default function MapPage() {
//   useEffect(() => {
//     // Initialize map
//     const map = L.map("map").setView([51.505, -0.09], 13);

//     // Add tile layer
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "© OpenStreetMap contributors",
//     }).addTo(map);

//     // Add geocoder control
//     L.Control.geocoder().addTo(map);
//   }, []);

//   return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
// }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "./MapPage.css";

// Fix for missing default marker icons in Leaflet with bundlers (like Vite/React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapPage() {
  useEffect(() => {
    // Prevent duplicate maps
    if (document.getElementById("map")?._leaflet_id) return;

    // Initialize map (default: London)
    const map = L.map("map").setView([51.505, -0.09], 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add geocoder (search box)
    L.Control.geocoder().addTo(map);

    // Add default marker at center
    const marker = L.marker([51.505, -0.09]).addTo(map);
    marker.bindPopup("<b>Hello!</b><br/>This is London.").openPopup();

    return () => {
      map.remove(); // cleanup
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        height: "100vh",
        width: "100%",
      }}
    />
  );
}
