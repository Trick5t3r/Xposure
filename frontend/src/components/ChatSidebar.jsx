import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import "../styles/ChatSidebar.css";
import { color } from "d3";
import MarkdownRenderer from "./MarkdownRenderer";

// Composant ChatSidebar
const ChatSidebar = forwardRef(({handleSendMessage, handleUploadFile}, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // Liste des fichiers uploadés
  const [isOpen, setIsOpen] = useState(false);
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
    <div className={`chat-sidebar ${isOpen ? "" : "closed"}`}>	
      <div className="chat-sidebar-header">
        <h6>Xposure Chat</h6>
      </div>
      <div className="chat-sidebar-messages">
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
                    color: "#26d8d8",
                    opacity: 0.8,
                  }}
                />
              )}
              <ListItemText
                sx={{
                  maxWidth: "70%",
                  background: message.role === "user" ? "linear-gradient(139deg, #116d75 0%, #26d8d8 100%)" : "#141414",
                  color: message.role === "user" ? "e4e4e4" : "#26d8d8",
                  border: message.role === "user" ? "none" : "1px solid #26d8d8",
                  opacity: message.role === "user" ? "1" : "0.8",
                  borderRadius: "15px",
                  padding: "10px",
                }}
                primary={message.content}
              />
              {/* <MarkdownRenderer markdown={message.content} /> */}
            </ListItem>
          ))}
          {/* Dummy div to help scroll to the bottom */}
          <div ref={messagesEndRef} />
        </List>
      </div>

      <div className="chat-sidebar-input">
        <TextField
            className="chat-sidebar-input-field"
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
                borderRadius: "8px", // Exemple : coins arrondis
                color: "#26d8d8", // Exemple : changer la couleur du texte
                opacity: 0.8, // Exemple : changer l'opacité du texte
                backgroundColor: "#141414",
              },
              "& .MuiOutlinedInput-input": {
                padding: "15px 19px", // Exemple : ajuster le padding
                outline: "none", // Exemple : enlever le contour
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#26d8d8", // Change la couleur du placeholder
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
                    color: "#141414",
                    background: "linear-gradient(139deg, #116d75 0%, #26d8d8 100%)",
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
    <div className="chat-sidebar-button">
      <IconButton onClick={() => setIsOpen(!isOpen)} sx={{
        color: "#116d75",
        }}>
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
    </div>
    </>
  );
});

export default ChatSidebar;
