import "./userinfo.css"

const Userinfo = ({ currentUser }) => {
    return (
        <div className="userinfo">
            <div className="user">
                <img src={currentUser?.avatar || "./avatar.png"} alt="User Avatar" />
                <h2>{currentUser?.username || "Guest User"}</h2>
            </div>
            <div className="icons">
                <img src="./more.png" alt="More options" />
                <img src="./video.png" alt="Video call" />
                <img src="./edit.png" alt="Edit profile" />
            </div>
        </div>
    )
}

export default Userinfo;