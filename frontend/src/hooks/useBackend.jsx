import { useState, useEffect, useRef } from "react";
import api, { createWebSocket } from "../api";

const useBackend = () => {
    const [messages, setMessages] = useState([]); // Stocke les messages du chat
    const [files, setFiles] = useState([]); // Stocke les fichiers
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
    const uploadFile = async ({file, selectedDate, selectedDashboardRegion}) => {
        console.log("upload file");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("date", selectedDate.toISOString().slice(0, 7));
        formData.append("region", ((selectedDashboardRegion === "all") || !(selectedDashboardRegion)) ? -1 : selectedDashboardRegion);
        console.log(formData);

        // Déterminer le type de fichier
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const resourceType = ["png", "jpg", "jpeg", "bmp", "tiff"].includes(fileExtension)
            ? "ImageFile"
            : fileExtension === "pdf"
            ? "PDFFile"
            : ["xls", "xlsx", "csv"].includes(fileExtension)
            ? "ExcelFile"
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

    const handleUploadFile = async ({e, selectedDate, selectedDashboardRegion}) => {
        console.log("upload")
        const file = e.target.files[0];
        if (file) {
          try {
            const fileData = await uploadFile({file, selectedDate, selectedDashboardRegion}); // Appelle la fonction parent pour gérer l'upload du fichier et obtenir les données
            setFiles((prev) => [...prev, { file, fileData }]); // Ajoute le fichier à la liste
          } catch (error) {
            console.error("Erreur lors de l'upload du fichier:", error);
          }
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

    const loadResultFile = async ({date, region, report = false}) => {
        console.log("load result file");
        try {
            const response = await api.get(`/api/${report ? "reportfile" : "resultfile"}/?date=${date}&region=${region}`);

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error("Failed to retrieve result file.");
            }
        } catch (error) {
            console.error("Error retrieval :", error.message);
            throw error;
        }
    };

    return {
        messages,
        files,
        datas,
        status,
        sendMessage,
        handleUploadFile,
        loadSession,
        loadResultFile,
    };
};

export default useBackend;
