import React, { useState } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";


const ChatSidebar = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "This is a response from ChatGPT-style bot.", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
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
        <Typography variant="h6" sx={{ display: isOpen ? "block" : "none"}}>
          Chat
        </Typography>
        <IconButton onClick={() => setIsOpen(!isOpen)} color="inherit">
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Box>

      {isOpen && (
        <>
          <Box sx={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            <List>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                  }}
                >
                  {message.sender === "bot" && (
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
                      backgroundColor: message.sender === "user" ? "#26d8d8e3" : "#ddd",
                      color: message.sender === "user" ? "white" : "black",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                    primary={message.text}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ padding: "10px", borderTop: "0px solid #ddd" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              color = "black"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSendMessage}>
                    <SendIcon color="#26d8d8e3" />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatSidebar;
