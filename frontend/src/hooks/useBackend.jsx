import { useState, useEffect, useRef } from "react";
import api, { createWebSocket } from "../api";

const useBackend = () => {
    const [messages, setMessages] = useState([]); // Stocke les messages du chat
    const [datas, setDatas] = useState([]); // Données supplémentaires (ex: graphiques)
    const [status, setStatus] = useState("disconnected"); // Statut du WebSocket
    const socketRef = useRef(null); // Référence au WebSocket
    const reconnectInterval = useRef(null); // Référence à l'intervalle de reconnexion

    const initializeWebSocket = () => {
        console.log("Initializing WebSocket connection...");
        const socket = createWebSocket("/ws/chat/");
        socketRef.current = socket;

        // Gestion des événements WebSocket
        socket.onopen = () => {
            console.log("WebSocket connected.");
            setStatus("connected");

            // Arrêter les tentatives de reconnexion
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
                reconnectInterval.current = null;
            }
        };

        socket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log("WebSocket message:", response);

            // Traiter les réponses en fonction du type
            switch (response.type) {
                case "get_session":
                    setMessages(response.data.messages);
                    setDatas(response.data.datas || []);
                    break;
                case "update_session":
                    setMessages(response.data.messages);
                    setDatas(response.data.datas || []);
                    break;
                case "delete_session":
                    setMessages([]);
                    setDatas([]);
                    break;
                case "error":
                    console.error("Error:", response.errors);
                    break;
                default:
                    console.warn("Unknown response type:", response.type);
            }
        };

        socket.onclose = () => {
            console.warn("WebSocket closed. Attempting to reconnect...");
            setStatus("disconnected");
            attemptReconnect();
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            socket.close(); // Fermer pour déclencher la reconnexion
        };
    };

    const attemptReconnect = () => {
        if (!reconnectInterval.current) {
            reconnectInterval.current = setInterval(() => {
                console.log("Attempting to reconnect WebSocket...");
                if (status === "disconnected") {
                    initializeWebSocket();
                }
            }, 5000); // Essaye de se reconnecter toutes les 5 secondes
        }
    };

    useEffect(() => {
        initializeWebSocket();

        // Nettoyage lors du démontage du composant
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, []);

    // Envoi d'un message via WebSocket
    const sendMessage = (newMessage) => {
        // Ajouter localement le message utilisateur
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Envoyer le message au serveur WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ method: "PATCH", newMessage: [newMessage] }));
        } else {
            console.error("WebSocket not connected.");
        }
    };

    // Téléchargement de fichier
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Déterminer le type de fichier
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const resourceType = ["png", "jpg", "jpeg", "bmp", "tiff"].includes(fileExtension)
            ? "ImageFile"
            : fileExtension === "pdf"
            ? "PDFFile"
            : "OtherFile";

        formData.append("resourcetype", resourceType);

        try {
            const response = await api.post(`/api/fileupload/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error("Failed to upload file.");
            }
        } catch (error) {
            console.error("Error uploading file:", error.message);
            throw error;
        }
    };

    // Charger les données initiales depuis l'API REST
    const loadSession = async () => {
        try {
            console.log("load session");
            const response = await api.get(`/api/chatsessions/`);
            setMessages(response.data.messages || []);
            setDatas(response.data.datas || []);
        } catch (error) {
            console.error("Error loading session messages:", error.message);
        }
    };

    return {
        messages,
        datas,
        status,
        sendMessage,
        uploadFile,
        loadSession,
    };
};

export default useBackend;
