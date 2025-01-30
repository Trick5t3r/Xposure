import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/ChartDashboard.css";

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// ["Négatif", "Factuel négatif", "Factuel", "Factuel positif", "Positif"]
// [30, 50, 20, 100, 13]
const ChartDashboard = () => {
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
    const fake_data = {
        "Négatif": 30,
        "Factuel négatif": 50,
        "Factuel": 20,
        "Factuel positif": 100,
        "Positif": 13
    };
    const data = themes.map((theme) => {
        return {
            "theme": theme,
            "content": fake_data
        }
    });

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

    return (
        <div className="chart-dashboard-container">
            {data.map((item, index) => (
                <div className="chart-component" key={index}>
                    <ChartComponents jsonData={item["content"]} title={item["theme"]} color={colors[index]}/>
                </div>
            ))}
        </div>
    )
}



export default ChartDashboard;