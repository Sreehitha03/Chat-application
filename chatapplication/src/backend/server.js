import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { router as authRoutes } from "./routes/auth.js";
import { router as chatRoutes } from "./routes/chats.js";
import { router as usersRoutes } from "./routes/users.js";
import { createServer } from "http";
import { Server } from "socket.io";
import db from "./db.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", usersRoutes);

const userSocketMap = new Map(); 

const onlineUserDetails = new Map(); 

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  let currentUserId = null; // To store the userId associated with THIS specific socket

  socket.on("userLoggedIn", async (userId, username) => {
    currentUserId = userId; // Associate the userId with the current socket

    if (!onlineUserDetails.has(userId)) {
      onlineUserDetails.set(userId, { id: userId, username: username, avatar: "./avatar.png" }); 
    }

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    console.log(`User ${username} (ID: ${userId}) logged in.`);
   
    const currentOnlineUsersArray = Array.from(onlineUserDetails.values());
    console.log("Broadcasting online users:", currentOnlineUsersArray);
    // Filter out the current user themselves from the list sent to the client
    io.emit("onlineUsers", currentOnlineUsersArray);
  });

  socket.on("send_message", async (data) => {
    console.log("Message received from client:", data);

    const { senderId, receiverId, text, timestamp } = data;

    try {
      const query = `
        INSERT INTO messages (sender_id, receiver_id, content, timestamp)
        VALUES (?, ?, ?, ?)
      `;
     
      await db.execute(query, [
        senderId,
        receiverId,
        text,
        new Date(timestamp),
      ]);
      console.log("Message saved to database.");

      const recipientSockets = userSocketMap.get(receiverId);
      if (recipientSockets) {
        recipientSockets.forEach((recipientSocketId) => {
          io.to(recipientSocketId).emit("receive_message", data);
        });

        
        const senderSockets = userSocketMap.get(senderId);
        if (senderSockets) {
          senderSockets.forEach((senderSocketId) => {
            io.to(senderSocketId).emit("receive_message", data); 
          });
        }
      } else {
        console.log(`User ${receiverId} is not online. Message saved to DB.`);
        io.to(socket.id).emit("receive_offline_notification", {
          message: "Recipient is offline, message delivered upon login.",
        });
      }
    } catch (error) {
      console.error("Error saving message to database:", error);
      io.to(socket.id).emit("send_message_error", {
        message: "Failed to send and save message.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (currentUserId) { // Only process if this socket was associated with a user
      const userSockets = userSocketMap.get(currentUserId);
      if (userSockets) {
        userSockets.delete(socket.id); // Remove this specific socket from the user's set

        if (userSockets.size === 0) {
          // If no more sockets for this user, they are truly offline
          userSocketMap.delete(currentUserId);
          // REMOVE FROM THE onlineUserDetails Map
          onlineUserDetails.delete(currentUserId);
          console.log(`User ${currentUserId} logged out. Online user IDs:`, Array.from(onlineUserDetails.keys())); 
        } else {
            console.log(`User ${currentUserId} still has ${userSockets.size} active sockets.`);
        }
      }
    }
    // Always re-emit the updated online user list on disconnect
    io.emit("onlineUsers", Array.from(onlineUserDetails.values()));
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server listening on port ${PORT}`);
});
