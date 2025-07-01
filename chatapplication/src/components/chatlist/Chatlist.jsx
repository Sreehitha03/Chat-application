import AddUser from "./addUser/AddUser";
import "./chatlist.css";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

// userId and setReceiverId passed from App.jsx
const Chatlist = ({ userId, setReceiverId }) => {
  const [addMode, setAddMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [allUsersFromDb, setAllUsersFromDb] = useState([]); 
  const socket = useRef(null);

  useEffect(() => {
    if (!userId) return; 

    if (!socket.current) {
        socket.current = io("http://localhost:5000");

        socket.current.on("connect", () => {
          console.log("Chatlist Socket connected:", socket.current.id);
        });

        socket.current.on("onlineUsers", (usersArray) => {
            console.log("Chatlist received online users:", usersArray); 
            // 'usersArray' is expected to be array of objects {id, username, avatar}
            setOnlineUsers(usersArray.filter(u => u.id !== userId));
        });

        socket.current.on("disconnect", () => {
          console.log("Chatlist Socket disconnected.");
        });

        socket.current.on("connect_error", (err) => {
          console.error("Chatlist Socket connection error:", err.message);
        });
    }

    const fetchAllUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        console.log("Fetched all users from DB:", response.data);
      
        setAllUsersFromDb(response.data.filter(u => u.id !== userId)); 
      } catch (error) {
        console.error("Error fetching all users:", error.response?.data?.message || error.message);
        toast.error("Failed to load users for adding.");
        setAllUsersFromDb([]); 
      }
    };

    fetchAllUsers(); 

  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
        console.log("Chatlist Socket disconnected during cleanup.");
      }
    };
  }, [userId]); 

  const handleAddUserToChatList = (userObject) => {
    console.log("Attempting to add user to chat list:", userObject);
    setChatUsers((prev) => {
        // Prevent adding duplicates
        if (!prev.some(u => u.id === userObject.id)) {
            console.log("User added to chatUsers state.");
            return [...prev, userObject];
        }
        console.log("User already in chatUsers state.");
        return prev; 
    });
    setReceiverId(userObject.id); // Automatically open chat with the newly added user
    setAddMode(false); 
    toast.success(`${userObject.username} added to your chat list!`);
  };

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="Search" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add User"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      <div className="chat-users">
        {chatUsers.map((user) => (
          <div
            key={user.id}
            className="item"
            onClick={() => setReceiverId(user.id)}
          >
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <div className="texts">
              <span>{user.username}</span>
              <p>{onlineUsers.some(onlineUser => onlineUser.id === user.id) ? "Online" : "Offline"}</p>
            </div>
          </div>
        ))}
      </div>

      {addMode && (
        <AddUser
          onlineUsers={onlineUsers} 
          allUsers={allUsersFromDb} 
          onAddUser={handleAddUserToChatList}
        />
      )}
    </div>
  );
};

export default Chatlist;
