import React, { useState, useEffect, useRef } from 'react';
import '../styles/WelcomePage.css';
import logo from '../assets/company-logo.jpg';
import bgMusic from '../assets/bg-music.mp3';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(new Audio(bgMusic));
  const navigate = useNavigate();

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.4;
  }, []);

  const handleStart = () => {
    const audio = audioRef.current;
    if (!isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log("Audio play failed:", error);
      });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
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
        <button onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {/* 🌙 Dark Mode Toggle */}
      <div className="toggle-switch">
        <label className="switch">
          <input type="checkbox" onChange={() => setDarkMode(!darkMode)} />
          <span className="slider round"></span>
        </label>
      </div>

      {/* 🎉 Welcome Card */}
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
