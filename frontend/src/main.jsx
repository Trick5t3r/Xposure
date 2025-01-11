import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/roboto/500.css';
import theme from "./theme";
import { ThemeProvider, CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset global des styles */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
