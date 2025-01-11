import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // Chakra par défaut est en mode clair
    primary: {
      main: "#4A5568", // Gris foncé adapté comme couleur principale
      contrastText: "#FFFFFF", // Texte blanc pour le contraste
    },
    secondary: {
      main: "#A0AEC0", // Gris clair pour les accents
      contrastText: "#FFFFFF", // Texte sombre pour le contraste sur le gris clair
    },      
    background: {
      default: "#F7FAFC", // Gris clair pour l'arrière-plan
      paper: "#FFFFFF", // Blanc pour les composants
    },
    text: {
      primary: "#2D3748", // Texte principal en gris foncé
      secondary: "#718096", // Texte secondaire
    },
    gray_color: {
      main: "#E3E3E3",
      contrastText: "#000000",
    },
    context_color: {
      main: "#F7FAFC",
      contrastText: "#000000",
    }
  },
  typography: {
    fontFamily: "'Inter', sans-serif", // Police par défaut de Chakra
    h1: { fontWeight: 700, fontSize: "2.25rem" }, // Style pour h1
    h2: { fontWeight: 700, fontSize: "1.875rem" },
    h3: { fontWeight: 700, fontSize: "1.5rem" },
    body1: { fontSize: "1rem", color: "#2D3748" },
    body2: { fontSize: "0.875rem", color: "#718096" },
  },
  shape: {
    borderRadius: 8, // Coins arrondis comme Chakra
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.12)", // Ombres similaires à Chakra
    "0px 4px 6px rgba(0, 0, 0, 0.1)",
  ],
});

export default theme;
