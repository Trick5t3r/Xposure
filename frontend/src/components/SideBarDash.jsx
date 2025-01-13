import React from 'react';
import '../styles/SideBarDash.css'; // Import the CSS file for styling
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'; // Import MUI icon
import FranceMap from '../components/FranceMap';

const SideBarDash = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <FranceMap />
        </li>
        <li className="sidebar-item">
          <a href="#section-analyses" className="sidebar-link"><strong>Analyses</strong></a>
        </li>
        <li className="sidebar-item">
          <a href="#section-relations-causales" className="sidebar-link"><strong>Relations Causales</strong></a>
        </li>
        <li className="sidebar-item">
          <a href="#section-predictions" className="sidebar-link"><strong>Prédictions</strong></a>
        </li>
        <li className="sidebar-item">
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
      </ul>
    </div>
  );
};

export default SideBarDash;
