import React from 'react';
import '../styles/SideBarDash.css'; // Import the CSS file for styling
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'; // Import MUI icon

const SideBarDash = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <a href="#home" className="sidebar-link"><strong>Analyse</strong></a>
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
        <li className="sidebar-item">
          <a href="#about" className="sidebar-link"><strong>Cause-Prédictions</strong></a>
        </li>
      </ul>
    </div>
  );
};

export default SideBarDash;
