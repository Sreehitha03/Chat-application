import React, { useState } from "react";
import "./addUser.css";

const AddUser = ({ onlineUsers, allUsers, onAddUser }) => {
  const [searchTerm, setSearchTerm] = useState("");

  
  console.log("AddUser received onlineUsers:", onlineUsers);
  console.log("AddUser received allUsers:", allUsers);

  // We will search from all registered users
  // Ensure allUsers is an array before attempting to use it
  const usersToSearch = Array.isArray(allUsers) ? allUsers : [];

  // Filter the users based on the search term 
  const filteredUsers = usersToSearch.filter((user) => {
    if (!user || !user.username) {
      console.warn("User object or username missing in allUsers:", user);
      return false; 
    }
    return user.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  console.log("AddUser filteredUsers:", filteredUsers);

  return (
    <div className="adduser">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          placeholder="Search Username..."
          name="username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div className="user" key={user.id}>
              <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
                <span>{user.username}</span>
                {Array.isArray(onlineUsers) && onlineUsers.some(onlineUser => onlineUser.id === user.id) && (
                    <span className="online-status" style={{color: "green", marginLeft: "10px"}}>Online</span>
                )}
              </div>
              <button onClick={() => onAddUser(user)}>Add User</button>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default AddUser;
