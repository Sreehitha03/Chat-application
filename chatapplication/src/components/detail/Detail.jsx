import "./detail.css";

const Detail = ({ currentUser, setCurrentUser, setReceiverId }) => {

  // const navigate = useNavigate(); // No longer needed if App.jsx handles route change based on state

  const handleLogout = () => {
    // 1. Clear the specific JWT token from localStorage
    localStorage.removeItem("token");

    // 2. Clear the currentUser state in App.jsx
    setCurrentUser(null);

    // 3. Clear the selected receiverId in App.jsx (important for a clean state)
    setReceiverId(null);

    // 4. (Optional) Disconnect the Socket.IO connection associated with this user
    //    This is usually handled by the `useEffect` cleanup in Chatlist and Chat
    //    when senderId (part of currentUser) becomes null.

    console.log("User logged out successfully.");
    // The App.jsx will automatically navigate to login because currentUser becomes null
    // navigate("/"); // This line is usually redundant now
  };

  return (
    <div className="detail">
      <div className="user">
        {/* Dynamically display current user's avatar and username */}
        <img src={currentUser?.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser?.username || "Sreehitha"}</h2> {/* Use currentUser.username */}
        <p>Hello</p> {/* This could also be dynamic, e.g., currentUser?.bio */}
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                {/* Ensure correct path for static images or use dynamic URLs */}
                <img src="https://expertphotography.b-cdn.net/wp-content/uploads/2022/05/Landscape-Photography-Sophie-Turner.jpg?width=3840" alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button>Block User</button>
        <button className="logout" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

export default Detail;