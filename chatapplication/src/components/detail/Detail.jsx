import "./detail.css";

const Detail = ({ currentUser, setCurrentUser, setReceiverId }) => {


  const handleLogout = () => {
    
    localStorage.removeItem("token");

    setCurrentUser(null);

    setReceiverId(null);

    console.log("User logged out successfully.");
    // The App.jsx will automatically navigate to login because currentUser becomes null

  };

  return (
    <div className="detail">
      <div className="user">
        <img src={currentUser?.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser?.username || "Sreehitha"}</h2>
        <p>Hello</p> 
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
