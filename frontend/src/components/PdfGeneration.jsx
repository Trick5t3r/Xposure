import "../styles/PdfGeneration.css";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

function PdfGeneration({selectedDashboardRegion, selectedDate, loadResultFile}) {
    const [reportFile, setReportFile] = useState(null);
    const dashboardRegion = (selectedDashboardRegion === "all" || (!selectedDashboardRegion)) ? -1 : selectedDashboardRegion;
    const dashboardDate = selectedDate.toISOString().slice(0, 7);

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

    useEffect(() => {
        loadResultFile({ date: dashboardDate, region: dashboardRegion, report: true })
            .then((result) => {
                setReportFile(result.length > 0 ? result[0] : null);  // Stocker le premier fichier
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération :", error);
                setReportFile(null);  // Gérer les erreurs proprement
            });
    }, [selectedDashboardRegion, selectedDate]);

    if (!reportFile) {
        return (
            <div className="pdf-generation-loading">
                <p>📄 Chargement du rapport PDF...</p>
            </div>
    );
    }

    return (
        <div className="pdf-generation">
            <h2>
                <a href={reportFile.file} download target="_blank" rel="noopener noreferrer">
                    Report : {dashboardDate} | {dashboardRegion === -1 ? "Toutes les régions" : regionMatch[dashboardRegion]}
                </a>
            </h2>
            <embed 
                src={reportFile.file} 
                type="application/pdf" 
                width="100%" 
                height="600px"
            />
        </div>
    );
}

export default PdfGeneration;