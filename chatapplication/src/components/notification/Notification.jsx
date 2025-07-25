import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = () => {
    return (
        <div className="notification">
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default Notification;
