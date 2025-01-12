import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const FranceMap = () => {
  const svgRef = useRef();
  const regionsGeoJsonUrl = "/france/regions.geojson";
  const departmentsGeoJsonUrl = "/france/departements.geojson";

  useEffect(() => {
    // Fonction pour charger et afficher les deux GeoJSON (départements et régions)
    const loadGeoJson = async () => {
      // Charger les fichiers GeoJSON
      const departmentsData = await d3.json(departmentsGeoJsonUrl);
      const regionsData = await d3.json(regionsGeoJsonUrl);

      // Définir les dimensions de la carte
      const width = 800;
      const height = 800;

      // Définir la projection centrée sur la France
      const projection = d3
        .geoMercator()
        .center([2.2137, 46.2276]) // Centré sur la France
        .scale(2500)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Sélectionner et préparer le SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Nettoyer l'ancien contenu


      // Ajouter les contours des départements
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
        // Ajouter les contours des régions
        svg
          .append("g")
          .selectAll("path")
          .data(regionsData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "rgba(0, 0, 0, 0.01)")
          .attr("stroke", "none")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,2") // Lignes en pointillés pour les régions
          .attr("class", "region-layer")
          .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "black");
          })
          .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", "rgba(0, 0, 0, 0.01)");
          });
    };

    loadGeoJson();
  }, []);

  return <svg ref={svgRef} width={800} height={1000}></svg>;
};

export default FranceMap;
