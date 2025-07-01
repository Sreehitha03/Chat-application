import "./chat.css";
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import axios from "axios"; 
import { toast } from "react-toastify"; 

const Chat = ({ senderId, receiverId }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!senderId || !receiverId) {
      setMessages([]);
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }
  
    // 1. Initialize socket if not already
    if (!socket.current) {
      socket.current = io("http://localhost:5000");
  
      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
      });
  
      socket.current.on("disconnect", () => {
        console.log("Socket disconnected.");
      });
  
      socket.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }
  
    // 2. Remove previous listener before adding a new one (prevents stale closure)
    socket.current.off("receive_message");
    socket.current.on("receive_message", (data) => {
      console.log("Real-time message received:", data);
      if (
        (data.senderId === senderId && data.receiverId === receiverId) ||
        (data.senderId === receiverId && data.receiverId === senderId)
      ) {
        setMessages((prev) => {
          if (!prev.some((msg) => msg.id === data.id)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });
  
    // 3. Fetch chat history
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/history/${senderId}/${receiverId}`);
        console.log("Fetched chat history:", response.data);
        setMessages(
          response.data.map((msg) => ({
            id: msg.id,
            text: msg.content,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error fetching chat history:", error.response?.data?.message || error.message);
        toast.error("Failed to load chat history.");
        setMessages([]);
      }
    };
  
    fetchChatHistory();
  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        console.log("Socket disconnected for cleanup.");
        socket.current = null;
      }
    };
  }, [senderId, receiverId]);
  

  // Scroll to the end of messages when a new one arrives (separate useEffect, good practice)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages (remains the same)
  const sendMessage = () => {
    if (text.trim() && senderId && receiverId && socket.current) {
      const message = {
        id: Date.now(), 
        text,
        senderId: senderId,
        receiverId: receiverId,
        timestamp: new Date(),
      };

      console.log("Sending message:", message);

      // Emit the message to the server
      socket.current.emit("send_message", message);

      // Add the message to the local state immediately
      setMessages((prev) => [...prev, message]);


      setText("");
    } else {
      console.warn("Cannot send message: text is empty, sender/receiver not set, or socket not connected.");
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{receiverId || "Select a user"}</span> {/* Display receiver's username */}
            <p>Last seen {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index} 
            className={`message ${msg.senderId === senderId ? "own" : ""}`}
          >
            <div className="texts">
              {msg.img && <img src={msg.img} alt="Sent" />} {/* If you add image sending */}
              <p>{msg.text}</p>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={receiverId ? "Type a message..." : "Select a user to chat"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => { // Add send on Enter key press
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          disabled={!receiverId} // Disable input if no receiver is selected
        />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className="sendButton" onClick={sendMessage} disabled={!receiverId || !text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;