import React, { useState } from 'react';
import { REFRESH_TOKEN, ACCESS_TOKEN, USERNAME } from "../constants";
import '../styles/SideBarDash.css'; // Import the CSS file for styling
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'; // Import MUI icon
import AnalyticsIcon from '@mui/icons-material/Analytics';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import LogoutIcon from '@mui/icons-material/Logout';
import FranceMap from '../components/FranceMap';
import {useNavigate} from "react-router-dom";

const SideBarDash = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    <a href="#section-analyses" className="sidebar-link"><AnalyticsIcon className="item-icon" />Analyses</a>,
    <a href="#section-relations-causales" className="sidebar-link"><QuestionMarkIcon className="item-icon" />Relations Causales</a>,
    <a href="#section-predictions" className="sidebar-link"><OnlinePredictionIcon className="item-icon" />Prédictions</a>
  ]

  const handleClick = (index) => {
    setSelectedIndex(index);
  };

  const handleLogout = () => {
          setTimeout(() => {
              localStorage.removeItem(ACCESS_TOKEN);
              localStorage.removeItem(REFRESH_TOKEN);
              localStorage.removeItem(USERNAME);
              window.location.reload(); // Recharge la page après 1s
          }, 100); // 1 seconde d'attente
  }
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <ul className="sidebar-list">
        <li className="sidebar-item-logo" onClick={() => navigate("/")}>Xposure</li>
        <li className="sidebar-item-france-map">
          <FranceMap />
        </li>
        {items.map((item, index) => (
        <li
          key={index}
          className={`sidebar-item ${selectedIndex === index ? "selected" : ""}`}
          onClick={() => handleClick(index)}
        >
          {item}
        </li>
      ))}
        <li className="sidebar-item-files">
          <p ><strong>Files</strong></p>
          <div className="dropdown">
            <ul className="dropdown-list">
              <li><a href="#doc1" className="dropdown-item">Doc1</a></li>
              <li><a href="#doc2" className="dropdown-item">Doc2</a></li>
              <li><a href="#doc3" className="dropdown-item">Doc3</a></li>
              <li><a href="#doc4" className="dropdown-item">Doc4</a></li>
              <li><a href="#doc5" className="dropdown-item">Doc5</a></li>
              <li><a href="#doc6" className="dropdown-item">Doc6</a></li>
            </ul>
            <button className="upload-button">
              <CloudUploadOutlinedIcon className="upload-icon" />
              Upload Document
            </button>
          </div>
        </li>
        <li className="sidebar-logout" onClick={handleLogout}><LogoutIcon className="item-icon" />Logout</li>
      </ul>
    </div>
  );
};

export default SideBarDash;
