import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Configuration de base pour Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // URL de base définie dans les variables d'environnement
});

// Intercepteur pour ajouter le token dans les requêtes HTTP
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Fonction pour initialiser un WebSocket
export const createWebSocket = (path) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost"; // URL de base pour dériver l'URL WebSocket
    const token = localStorage.getItem(ACCESS_TOKEN); // Récupère le token pour l'authentification

    // Convertit l'URL de base en URL WebSocket
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
    const url = new URL(baseUrl);
    const wsUrl = `${wsProtocol}://${url.host}${path}`; // Exemple : ws://localhost:8000/ws/chat/

    // Initialise le WebSocket avec le token d'authentification
    const socket = new WebSocket(`${wsUrl}?token=${token}`);

    // Gestion des événements WebSocket
    socket.onopen = () => {
        console.log("WebSocket connected to:", wsUrl);
    };

    socket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    return socket;
};

// Export des utilitaires
export default api;
