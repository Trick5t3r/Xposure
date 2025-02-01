import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../styles/FranceMap.css";

const RegionMap = ({ selectedRegion }) => {
  const svgRegionRef = useRef();
  const regionsGeoJsonUrl = "/france/regions.geojson";
  const departmentsGeoJsonUrl = "/france/departements.geojson";
  const regionDepartmentsUrl = "/france/region-departement.json";

  useEffect(() => {
    const loadGeoJson = async () => {
      const regionsData = await d3.json(regionsGeoJsonUrl);
      const departmentsData = await d3.json(departmentsGeoJsonUrl);
      const regionDepartmentsData = await d3.json(regionDepartmentsUrl);
      
      const width = 200;
      const height = 180;

      const projection = d3
        .geoMercator()
        .center([2.2137, 46.2276])
        .scale(700)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      const svg = d3.select(svgRegionRef.current);
      svg.selectAll("*").remove();

      if (selectedRegion === "all") {
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .text("All regions");
        return;
      }

      const selectedRegionData = regionsData.features.find(
        (region) => region.properties.code === selectedRegion
      );

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
          .attr("fill", "#a0c4ff")
          .attr("stroke", "#333")
          .attr("stroke-width", 1);
      }
    };

    loadGeoJson();
  }, [selectedRegion]);

  return (
    <div className="filtered-france-map-container">
      <p>Selected Region: {selectedRegion === "all" ? "All regions" : selectedRegion}</p>
      <svg className="filtered-france-map" ref={svgRegionRef}></svg>
    </div>
  );
};

export default RegionMap;
