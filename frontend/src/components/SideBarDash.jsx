import React, { useState } from 'react';
import { REFRESH_TOKEN, ACCESS_TOKEN, USERNAME } from "../constants";
import '../styles/SideBarDash.css'; // Import the CSS file for styling
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PublicIcon from '@mui/icons-material/Public';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BarChartIcon from '@mui/icons-material/BarChart';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import FranceMap from '../components/FranceMap';
import {useNavigate} from "react-router-dom";

const SideBarDash = ({setActiveSection, setSelectedDashboardRegion}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    <a className="sidebar-link"><AttachFileIcon className="item-icon" />Files management</a>,
    <a className="sidebar-link"><PublicIcon className="item-icon" />Geographic</a>,
    <a className="sidebar-link"><BarChartIcon className="item-icon" />Theme comparison</a>,
    <a className="sidebar-link"><SmartToyIcon className="item-icon" />AI Assistant</a>,
    <a className="sidebar-link"><CreateIcon className="item-icon" />Generate report</a>,
  ]

  const handleClick = (index) => {
    setSelectedIndex(index);
    setActiveSection(index);
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
          <FranceMap setSelectedDashboardRegion={setSelectedDashboardRegion}/>
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
        <li className="sidebar-logout" onClick={handleLogout}><LogoutIcon className="item-icon" />Logout</li>
      </ul>
    </div>
  );
};

export default SideBarDash;