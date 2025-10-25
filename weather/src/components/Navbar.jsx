import { Link } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🌦 WeatherApp</Link>
      </div>

      {/* Desktop Links */}
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/forecast">5-Day Forecast</Link>
        <Link to="/map">Satellite Map</Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/forecast" onClick={() => setIsOpen(false)}>5-Day Forecast</Link>
          <Link to="/map" onClick={() => setIsOpen(false)}>Satellite Map</Link>
        </div>
      )}
    </nav>
  );
}
