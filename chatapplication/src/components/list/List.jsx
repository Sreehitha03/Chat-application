import "./list.css";
import Chatlist from "../chatlist/Chatlist";
import Userinfo from "../userinfo/Userinfo";

// Receive currentUser and setReceiverId from App.jsx
const List = ({ currentUser, setReceiverId }) => {
  return (
    <div className="list">
      <Userinfo currentUser={currentUser} />
      <Chatlist userId={currentUser.id} setReceiverId={setReceiverId} />
    </div>
  );
};

export default List;
