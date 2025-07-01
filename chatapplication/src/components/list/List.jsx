import "./list.css";
import Chatlist from "../chatlist/Chatlist";
import Userinfo from "../userinfo/Userinfo";

// Receive currentUser and setReceiverId from App.jsx
const List = ({ currentUser, setReceiverId }) => {
  return (
    <div className="list">
      <Userinfo currentUser={currentUser} /> {/* Pass currentUser to Userinfo */}
      <Chatlist userId={currentUser.id} setReceiverId={setReceiverId} /> {/* Pass userId and setReceiverId to Chatlist */}
    </div>
  );
};

export default List;