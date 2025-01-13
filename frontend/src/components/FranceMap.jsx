import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const FranceMap = () => {
  const svgRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const regionsGeoJsonUrl = "/france/regions.geojson";
  const departmentsGeoJsonUrl = "/france/departements.geojson";

  const handleRegionClick = (regionName, regionCode) => {
    setSelectedRegion(regionCode);
    if (regionCode === "all") {
      alert("All regions");
    } else {
      alert(`Région : ${regionName}, Code : ${regionCode}`);
    }
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
        .attr("fill", d => (d.properties.code === selectedRegion ? "rgba(254, 254, 0, 0.5)" : "rgba(0, 0, 0, 0.01)"))
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

  return (
    <div>
      <svg ref={svgRef} width={250} height={175}></svg>
      <button
        style={{
          marginTop: "0px",
          padding: "6px 15px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => handleRegionClick("All", "all")}
      >
        All
      </button>
    </div>
  );
};

export default FranceMap;