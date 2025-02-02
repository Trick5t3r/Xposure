import React from "react";
import { Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/ChartDashboard.css";

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// ["Négatif", "Factuel négatif", "Factuel", "Factuel positif", "Positif"]
// [30, 50, 20, 100, 13]
const ChartDashboard = ({selectedDashboardRegion, selectedDate, loadResultFile}) => {
    const [resultFile, setResultFile] = useState([]);
    function normalizeString(str) {
        return str
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[-\s\/']/g, "") // Ajout de l'apostrophe ici
            .toLowerCase();
    };    
    const themes = [
        "Transition écologique",
        "Linky",
        "RSE",
        "Marque employeur/Rh",
        "Innovation",
        "Aléas Climatiques",
        "Divers",
        "Raccordement",
        "Réseau",
        "Clients",
        "Mobilité électrique",
        "Partenariats",
        "Prévention"
    ];
    const themesMatch = themes.reduce((acc, theme) => {
        acc[normalizeString(theme)] = theme;
        return acc;
    }, {});
    
    console.log(themesMatch);

    const colors = [
        "#FFC328",
        "#A5D936",
        "#2382D2",
        "#C8AF87",
        "#385723",
        "#EB6E3C",
        "#4BC3C3",
        "#41A57D",
        "#AF2891",
        "#8755C8",
        "#232873",
        "#463C3C",
        "#1423DC"
    ];
    const retours = [
        "Négatif",
        "Négatif nuancé",
        "Factuel négatif",
        "Factuel",
        "Factuel positif",
        "Positif nuancé",
        "Positif"
    ];
    const retourMatch = retours.reduce((acc, retour) => {
        acc[normalizeString(retour)] = retour;
        return acc;
    }, {});

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

    const generateRandomData = (retours) => {
        const obj = {};
        retours.forEach(retour => {
            obj[retour] = Math.floor(Math.random() * 100); // Valeur aléatoire entre 0 et 100
        });
        return obj;
    };

    const computeThemeStats = (data, themes, retours) => {
        let stats = themes.map(theme => ({
            theme,
            content: Object.fromEntries(retours.map(retour => [retour, 0]))
        }));
    
        let statsMap = Object.fromEntries(stats.map(item => [item.theme, item.content]));
    
        data.forEach(({ "Thème": theme, "Qualité du retour": retour }) => {
            if (statsMap[themesMatch[normalizeString(theme)]] && statsMap[themesMatch[normalizeString(theme)]][retourMatch[normalizeString(retour)]] !== undefined) {
                statsMap[themesMatch[normalizeString(theme)]][retourMatch[normalizeString(retour)]]++;
            }
        });
    
        return stats;
    };

    // const data = themes.map((theme) => {
    //     return {
    //         "theme": theme,
    //         "content": generateRandomData(retours)
    //     }
    // });
    const data = computeThemeStats(resultFile, themes, retours);

    const ChartComponents = ({ jsonData, title, color }) => {
        const labels = Object.keys(jsonData);
        const values = Object.values(jsonData);
        const data = {
          labels: labels, // Différents types de retours
          datasets: [
            {
              label: "Nombre d'articles",
              data: values, // Exemple de valeurs
              backgroundColor: `${color}`, // Couleur verte
              borderColor: `${color}`, // Bordure plus foncée
              borderWidth: 1,
            },
          ],
        };
      
        const options = {
          responsive: true,
          maintainAspectRatio: false, // Désactive l'aspect ratio forcé (150px de hauteur par défaut)
          plugins: {
            legend: {
              display: false, // Masquer la légende
            },
            title: {
              display: true,
              text: `${title}`,
              color: "#141414", // Couleur du titre
              font: {
                size: 20, // Taille de la police du titre
                family: "font-reg, sans-serif", // Police du titre
            }
            },
          },
          scales: {
            x: {
                ticks: {
                    font: {
                        size: 12, // Taille de la police des labels X
                        family: "font-reg, sans-serif", // Police des labels X
                        weight: "bold"
                    },
                    color: "#141414" // Couleur des labels X
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 12, // Taille de la police des labels Y
                        family: "font-reg, sans-serif", // Police des labels Y
                        weight: "bold"
                    },
                    color: "#141414" // Couleur des labels Y
                }
            }
        }
        };
      
        return <Bar data={data} options={options} />;
    };

    const mediaMatch = {
        "nordlitoral": "Nord Littoral",
        "nordlittoral": "Nord Littoral",
        "lavoixdunord": "La Voix du Nord",
        "lepharedunkerquois": "Nord Littoral",
        "lejournaldesflandres": "Nord Littoral",
        "lobservateur": "L'Observateur",
        "nordeclair": "La Voix du Nord"
    };
    const medias = ["Nord Littoral", "La Voix du Nord", "L'Observateur"];

    const computeMediaStats = (data, medias, retours) => {
        let stats = medias.map(media => ({
            media,
            content: Object.fromEntries(retours.map(retour => [retour, 0]))
        }));
    
        let statsMap = Object.fromEntries(stats.map(item => [item.media, item.content]));
    
        data.forEach(({ "Média": media, "Qualité du retour": retour }) => {
            if (statsMap[mediaMatch[normalizeString(media)]] && statsMap[mediaMatch[normalizeString(media)]][retourMatch[normalizeString(retour)]] !== undefined) {
                statsMap[mediaMatch[normalizeString(media)]][retourMatch[normalizeString(retour)]]++;
            }
        });
    
        return stats;
    };

    const dataMedia = computeMediaStats(resultFile, medias, retours);
    return (
        <div className="chart-dashboard-container">
            <h1>Theme Analysis</h1>
            <div className="first-chart-container">
                {data.map((item, index) => (
                    <div className="chart-component" key={index}>
                        <ChartComponents jsonData={item["content"]} title={item["theme"]} color={colors[index]}/>
                    </div>
                ))}
            </div>
            <h1>Media Analysis</h1>
            <div className="second-chart-container">
                {dataMedia.map((item, index) => (
                        <div className="chart-component" key={index}>
                            <ChartComponents jsonData={item["content"]} title={item["media"]} color={colors[index]}/>
                        </div>
                    ))}
            </div>
        </div>
    )
}



export default ChartDashboard;