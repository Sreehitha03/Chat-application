import React, { useState, useEffect, useRef } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client"; 

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const socket = useRef(null);

  
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
      
        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn("Token expired. Logging out.");
          localStorage.removeItem("token");
          setCurrentUser(null); 
          // Disconnect socket if it's connected and token is invalid
          if (socket.current) {
            socket.current.disconnect();
            socket.current = null;
          }
          return; 
        }

        // Token is valid and not expired, set currentUser
        const userData = {
          id: decodedToken.userId,
          username: decodedToken.username,
          email: decodedToken.email,
          avatar: decodedToken.avatar || "./avatar.png", 
        };
        setCurrentUser(userData);

        // Initialize global Socket.IO connection for this user
        if (!socket.current) {
          socket.current = io("http://localhost:5000");
          console.log("App Socket connecting...");

          socket.current.on("connect", () => {
            console.log("App Socket connected:", socket.current.id);
            // Emit userLoggedIn only when connected AND currentUser is available
            if (userData.id) {
              socket.current.emit("userLoggedIn", userData.id, userData.username);
            }
          });

          socket.current.on("disconnect", () => {
            console.log("App Socket disconnected.");
          });

          socket.current.on("connect_error", (err) => {
            console.error("App Socket connection error:", err.message);
          });
        }
        // If socket already exists and is connected, ensure userLoggedIn is emitted
        else if (socket.current.connected && userData.id) {
            socket.current.emit("userLoggedIn", userData.id, userData.username);
        }

      } catch (error) {
        console.error("Failed to decode or validate token:", error);
        localStorage.removeItem("token");
        setCurrentUser(null); // Set user to null if token is malformed/invalid
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      }
    } else {
      // No token found in localStorage, ensure user is null
      setCurrentUser(null);
      // Disconnect socket if no token is present
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    }

    // Cleanup for App's socket connection
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? (
                <>
                  <List currentUser={currentUser} setReceiverId={setReceiverId} />
                  <Chat senderId={currentUser.id} receiverId={receiverId} />
                  <Detail
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    setReceiverId={setReceiverId}
                  />
                </>
              ) : (
                <Login setCurrentUser={setCurrentUser} />
              )
            }
          />
        </Routes>
        <Notification />
      </div>
    </Router>
  );
};

export default App;
