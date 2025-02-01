import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import RegionMap from "./RegionMap";
import { PieChart, LineChart } from "./ChartComponents";
import "../styles/GeographicDashboard.css";
import * as d3 from "d3";

const GeographicDashboard = forwardRef(({loadSession, selectedDashboardRegion, selectedDate, loadResultFile}) => {
    const [resultFile, setResultFile] = useState([]);
  useEffect(() => {
      loadSession();
      console.log(selectedDashboardRegion);
    }, [selectedDashboardRegion]);

    const regionMatch = {
      "-1": "All Regions",
      "53": "Bretagne",
      "28": "Normandie",
      "32": "Hauts-de-France",
      "44": "Grand Est",
      "11": "Île-de-France",
      "27": "Bourgogne-Franche-Comté",
      "24": "Centre-Val de Loire",
      "75": "Nouvelle-Aquitaine",
      "84": "Auvergne-Rhône-Alpes",
      "76": "Occitanie",
      "93": "Provanse-Alpes-Côte d'Azur",
      "94": "Corse"
  };

  const returnMapping = {
    "Négatif": -3,
    "Négatif nuancé": -2,
    "Factuel négatif": -1,
    "Factuel": 0,
    "Factuel positif": 1,
    "Positif nuancé": 2,
    "Positif": 3,
    "Non renseigné": 10,
  };

  const colorScale = d3.scaleLinear()
  .domain([-3, -2, -1, 0, 1, 2, 3, 10])
  .range(["#8B0000", "#D73027", "#FC8D59", "#FEE08B", "#D9EF8B", "#91CF60", "#1A9850", "#e4e4e4"]);

  const dashboardRegion = (selectedDashboardRegion === "all" || (!selectedDashboardRegion)) ? -1 : selectedDashboardRegion;
  const dashboardDate = selectedDate.toISOString().slice(0, 7);
  useEffect(() => {
      loadResultFile({date: dashboardDate, region: dashboardRegion}).then((result) => {
          setResultFile(result);
      })
      .catch((error) => {
          console.error("Erreur lors de la récupération :", error);
      });
  }, [selectedDashboardRegion, selectedDate]);

  console.log("resultFile", resultFile);

  return (
    <div className="geographic-dashboard">
      <RegionMap selectedRegion={selectedDashboardRegion} resultFile={resultFile} />
      <div className="geographic-legend">
        <h1>{regionMatch[selectedDashboardRegion]}</h1>
          <ul className="legend-list">
            {Object.entries(returnMapping).map(([label, value]) => (
              <li key={value} className="legend-item">
                <span className="color-box" style={{ backgroundColor: colorScale(value) }}></span>
                {label}
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
});

export default GeographicDashboard;
