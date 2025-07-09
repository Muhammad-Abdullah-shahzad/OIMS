import React, { useState, useEffect } from 'react';
import '../styles/WelcomePage.css';
import logo from '../assets/company-logo.jpg';
import bgMusic from '../assets/bg-music.mp3';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [audio] = useState(new Audio(bgMusic));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.4;
  }, [audio]);

  const handleStart = () => {
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(console.log);
    }
  };

  const toggleMute = () => {
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={`welcome-root ${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={handleStart}>
      
      {/* 🔊 Sound Button */}
      <div className="sound-toggle">
        <button onClick={toggleMute}>
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {/* 🔘 Dark Mode Toggle */}
      <div className="toggle-switch">
        <label className="switch">
          <input type="checkbox" onChange={() => setDarkMode(!darkMode)} />
          <span className="slider round"></span>
        </label>
      </div>

      {/* 🌟 Center Glass Card */}
      <div className="welcome-content">
        <img src={logo} alt="OraDigitals Logo" className="logo" />
        <h1 className="title">OraDigitals</h1>
        <p className="slogan">Welcome to Oradigitals - Where Digital Excellence Meets Innovation!</p>
        <p className="service">IT Services and IT Consulting</p>
        <button className="get-started" onClick={goToLogin}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
