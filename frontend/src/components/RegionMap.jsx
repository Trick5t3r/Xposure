import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../styles/FranceMap.css";
import "../styles/RegionMap.css";

const RegionMap = ({ selectedRegion, resultFile }) => {
  const svgRegionRef = useRef();
  const regionsGeoJsonUrl = "/france/regions.geojson";
  const departmentsGeoJsonUrl = "/france/departements.geojson";
  const regionDepartmentsUrl = "/france/region-departement.json";
  const width = 500;
  const height = 300;

  const returnMapping = {
    "Négatif": -3,
    "Négatif nuancé": -2,
    "Factuel négatif": -1,
    "Factuel": 0,
    "Factuel positif": 1,
    "Positif nuancé": 2,
    "Positif": 3
  };

  const normalizeTerritory = (territory) => {
    if (!territory) return "";
    return territory.toLowerCase().replace(/\s|-/g, ""); //  Met en minuscules et supprime espaces/tirets
  };

  console.log("resultFile", resultFile);

  const computeAverageReturnByTerritory = (resultFile) => {
    const territoryScores = {};
  
    resultFile.forEach(({ Territoire, "Qualité du retour": retour }) => {
      if (!Territoire || !returnMapping[retour]) {
        console.log("Territoire DB", normalizeTerritory(Territoire));
        return;
      };
  
      if (!territoryScores[normalizeTerritory(Territoire)]) {
        territoryScores[normalizeTerritory(Territoire)] = { total: 0, count: 0 };
      }

      // Ajouter la valeur correspondante à la Qualité du retour
      territoryScores[normalizeTerritory(Territoire)].total += returnMapping[retour];
      territoryScores[normalizeTerritory(Territoire)].count += 1;
    });
    // Calculer la moyenne
    const territoryAverages = {};
    Object.keys(territoryScores).forEach(territory => {
      territoryAverages[territory] = Math.round(territoryScores[territory].total / territoryScores[territory].count);
    });

    return territoryAverages;
  };

  const colorScale = d3.scaleLinear()
  .domain([-3, -2, -1, 0, 1, 2, 3, 10])
  .range(["#8B0000", "#D73027", "#FC8D59", "#FEE08B", "#D9EF8B", "#91CF60", "#1A9850", "#e4e4e4"]);
  
  const territoryAverages = computeAverageReturnByTerritory(resultFile);
  useEffect(() => {
    const loadGeoJson = async () => {
      const regionsData = await d3.json(regionsGeoJsonUrl);
      const departmentsData = await d3.json(departmentsGeoJsonUrl);
      const regionDepartmentsData = await d3.json(regionDepartmentsUrl);

      let centerCoordinates = [2.2137, 46.2276]; // Par défaut, centre de la France
      let scaleFactor = 1100; // Facteur de zoom par défaut

      const selectedRegionData = regionsData.features.find(
        (region) => region.properties.code === selectedRegion
      );

      if (selectedRegionData) {
        centerCoordinates = d3.geoCentroid(selectedRegionData); // 🔴 Centre exact de la région
        scaleFactor = 2500; // 🔴 Zoom plus important sur une seule région
      };

      const projection = d3
        .geoMercator()
        .center(centerCoordinates)
        .scale(scaleFactor)
        .translate([0.5 * width, 0.5 * height]);

      const path = d3.geoPath().projection(projection);

      const svg = d3.select(svgRegionRef.current);
      svg.selectAll("*").remove();

      if ((selectedRegion === "all") || (!selectedRegion)) {
        svg.append("g")
          .selectAll("path")
          .data(regionsData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#26d8d8")
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);

        svg.append("g")
          .selectAll("path")
          .data(departmentsData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const territoire = d.properties.nom;
            return colorScale(territoryAverages[normalizeTerritory(territoire)] || 10);
          })
          .attr("stroke", "#333")
          .attr("stroke-width", 1);
        return;
      };

      if (selectedRegionData) {
        svg
          .append("g")
          .selectAll("path")
          .data([selectedRegionData])
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#26d8d8")
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);
      }

      const departmentCodes = regionDepartmentsData.regions[selectedRegion]?.departments || [];
      const selectedDepartments = departmentsData.features.filter(
        (department) => departmentCodes.includes(department.properties.code)
      );

      if (selectedDepartments.length > 0) {
        svg
          .append("g")
          .selectAll("path")
          .data(selectedDepartments)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const territoire = d.properties.nom; // Nom du département
            console.log("Territoire carte", normalizeTerritory(territoire))
            return colorScale(territoryAverages[normalizeTerritory(territoire)] || 10); // 🔴 Appliquer la couleur selon la moyenne
          })
          .attr("stroke", "#333")
          .attr("stroke-width", 1);
      }
    };

    loadGeoJson();
  }, [selectedRegion]);

  return (
    <div className="filtered-france-map-container">
      <svg className="filtered-france-map" ref={svgRegionRef} preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  );
};

export default RegionMap;
