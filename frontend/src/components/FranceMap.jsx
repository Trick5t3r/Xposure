import React, { useEffect, useRef, useState } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import * as d3 from "d3";
import "../styles/FranceMap.css";

const FranceMap = () => {
  const svgRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const [isRotated, setIsRotated] = useState(false);
  const regionsGeoJsonUrl = "/france/regions.geojson";
  const departmentsGeoJsonUrl = "/france/departements.geojson";

  const handleRegionClick = (regionName, regionCode) => {
    setSelectedRegion(regionCode);
    setSelectedRegionName(regionName);
  };

  useEffect(() => {
    const loadGeoJson = async () => {
      const departmentsData = await d3.json(departmentsGeoJsonUrl);
      const regionsData = await d3.json(regionsGeoJsonUrl);

      const width = 200;
      const height = 180;

      const projection = d3
        .geoMercator()
        .center([2.2137, 46.2276])
        .scale(700)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .append("g")
        .selectAll("path")
        .data(departmentsData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#d4d4d4")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .attr("class", "department-layer");

      svg
        .append("g")
        .selectAll("path")
        .data(regionsData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => (d.properties.code === selectedRegion ? "#26d8d8" : "rgba(0, 0, 0, 0.01)"))
        .attr("stroke", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,2")
        .attr("class", "region-layer")
        .on("mouseover", function (event, d) {
          if (d.properties.code !== selectedRegion) {
            d3.select(this).attr("fill", "black");
          }
        })
        .on("mouseout", function (event, d) {
          if (d.properties.code !== selectedRegion) {
            d3.select(this).attr("fill", "rgba(0, 0, 0, 0.01)");
          }
        })
        .on("click", function (event, d) {
          const regionName = d.properties.nom; // Remplacez 'nom' par la clé réelle pour le nom
          const regionCode = d.properties.code; // Remplacez 'code' par la clé réelle pour le code
          handleRegionClick(regionName, regionCode);
        });
    };

    loadGeoJson();
  }, [selectedRegion]);

  if (isRotated) {
    setTimeout(() => {
      setIsRotated(false);
    }, 100);
    
  }

  return (
    <div className="france-map-container">
      <svg className="france-map" ref={svgRef}></svg>
      <div
        className="region-button"
      >
        <p>{selectedRegionName ? selectedRegionName : "All Regions"}</p>
        <div className="reset-button"><RestartAltIcon className={`reset-icon ${isRotated ? "rotate" : ""}`} onClick={() => {handleRegionClick("All Regions", "all"); setIsRotated(true)}} /></div>
      </div>
    </div>
  );
};

export default FranceMap;