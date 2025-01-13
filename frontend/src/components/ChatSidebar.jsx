import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";

// Composant ChatSidebar
const ChatSidebar = forwardRef(({handleSendMessage, handleUploadFile}, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // Liste des fichiers uploadés
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: "92px",
        bottom: 0,
        width: isOpen ? "300px" : "50px",
        backgroundColor: "#f5f5f5",
        borderLeft: "1px solid #ddd",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#26d8d8e3",
          color: "white",
        }}
      >
        <Typography variant="h6" sx={{ display: isOpen ? "block" : "none" }}>
          Chat
        </Typography>
        <IconButton onClick={() => setIsOpen(!isOpen)} color="inherit">
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Box>

      {isOpen && (
        <>
          <Box
            sx={{ flex: 1, overflowY: "auto", padding: "10px" }}
          >
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
                        color: "#26d8d8e3",
                      }}
                    />
                  )}
                  <ListItemText
                    sx={{
                      maxWidth: "70%",
                      backgroundColor: message.role === "user" ? "#26d8d8e3" : "#ddd",
                      color: message.role === "user" ? "white" : "black",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                    primary={message.content}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ padding: "10px", borderTop: "1px solid #ddd" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend}>
                    <SendIcon sx={{ color: "#26d8d8e3" }} />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
});

export default ChatSidebar;
