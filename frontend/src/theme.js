import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // Chakra par défaut est en mode clair
    primary: {
      main: "#1423dc", // Bleu d'ENEDIS
      contrastText: "#E1E1E1", // Texte blanc pour le contraste
    },
    secondary: {
      main: "#93c90e", // Vert d'ENEDIS
      contrastText: "#FFFFFF", // Texte sombre pour le contraste sur le gris clair
    },      
    background: {
      default: "#0F0F0F", // Gris clair pour l'arrière-plan
      paper: "#FFFFFF", // Blanc pour les composants
    },
    text: {
      primary: "#E1E1E1", // Texte principal en gris foncé
      secondary: "red", // Texte secondaire
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
    fontWeightRegular: 400,
    fontWeightBold: 700,
    h1: { fontWeight: 700, fontSize: "4.210rem", letterSpacing: 0, lineHeight: 1.3}, // Style pour h1
    h2: { fontSize: "3.158rem" },
    h3: { fontSize: "2.369rem" },
    h4: { fontSize: "1.777rem" },
    h5: { fontSize: "1.333rem" },
    body1: { fontSize: "1rem", fontWeight: 400 }, // Style pour body1
    body2: { fontSize: "0.875rem" },
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