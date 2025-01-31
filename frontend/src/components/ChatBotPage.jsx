import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import "../styles/ChatBotPage.css";
import { color, text } from "d3";
import MarkdownRenderer from "./MarkdownRenderer";

// Composant ChatSidebar
const ChatBotPage = forwardRef(({handleSendMessage, handleUploadFile, loadSession}, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // Liste des fichiers uploadés
  const backgroundColor = "#141414";
  const textColor = "#e4e4e4";
  const inputColor = "#d4d4d4";
  const gradientColor = "linear-gradient(139deg, #141414 0%, #141414 90%,#e4e4e4 100%)";
  const messagesEndRef = useRef(null); // Ref to track the end of the messages list

  // Expose la méthode setMessages au parent
  useImperativeHandle(ref, () => ({
    setMessages: (newMessages) => {
      if (typeof newMessages === "function") {
        setMessages((prevMessages) => newMessages(prevMessages));
      } else {
        setMessages(newMessages || []); // Ensure newMessages defaults to an empty array
      }
    },
  }));
  useEffect(() => {
    loadSession();
  }, []);

  const handleSend = () => {
    if (input.trim() !== "" || uploadedFiles.length > 0) {
      handleSendMessage({ message: input, files: uploadedFiles }); // Envoie le message et les fichiers
      setInput(""); // Efface le champ d'entrée
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend(); // Envoie le message lorsqu'on appuie sur Entrée
    }
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
    <div className="chat-bot-page">	
        <div className="chat-bot-page-messages-container">
            <div className="chat-bot-page-messages">
                <List>
                    {messages.map((message, index) => (
                    <ListItem
                        key={index}
                        sx={{
                        justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                        alignItems: "flex-start",
                        }}
                    >
                        {message.role === "assistant" && (
                        <SmartToyIcon
                            sx={{
                            marginRight: "10px",
                            color: `${backgroundColor}`,
                            }}
                        />
                        )}
                        <ListItemText
                        sx={{
                            maxWidth: message.role === "user" ? "70%" : "100%",
                            background: message.role === "user" ? `${gradientColor}` : `${textColor}`,
                            color: message.role === "user" ? `${textColor}` : `${backgroundColor}`,
                            borderRadius: "15px",
                            padding: "0 20px",
                        }}
                        primary={<MarkdownRenderer markdown={message.content} />}
                        />
                        {/* <MarkdownRenderer markdown={message.content} /> */}
                    </ListItem>
                    ))}
                    {/* Dummy div to help scroll to the bottom */}
                    <div ref={messagesEndRef} />
                </List>
            </div>
        </div>  
        

        <div className="chat-bot-page-input">
            <TextField
                className="chat-bot-page-input-field"
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Supprime l'outline
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Supprime aussi au survol
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Supprime aussi au focus
                    },
                    "& .MuiOutlinedInput-root": {
                    borderRadius: "15px", // Exemple : coins arrondis
                    color: `${backgroundColor}`, // Exemple : changer la couleur du texte
                    backgroundColor: `${inputColor}`,
                    },
                    "& .MuiOutlinedInput-input": {
                    padding: "27px 32px", // Exemple : ajuster le padding
                    outline: "none", // Exemple : enlever le contour
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                    color: `${backgroundColor}`, // Change la couleur du placeholder
                    opacity: 0.6, // Change l'opacité du placeholder
                    },
                }}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                    endAdornment: (
                    <IconButton onClick={handleSend}>
                        <SendIcon sx={{ 
                        color: `${textColor}`,
                        background: `${gradientColor}`,
                        borderRadius: "50%",
                        height: "50px",
                        width: "50px",
                        padding: "10px",
                        }} />
                    </IconButton>
                    ),
                }}
                />
        </div>
    </div>
    </>
  );
});

export default ChatBotPage;