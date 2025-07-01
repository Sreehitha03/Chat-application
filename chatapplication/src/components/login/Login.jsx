import "./login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 

const Login = ({ setCurrentUser }) => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSignInChange = (e) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signin", signInData);
      toast.success("Signed in successfully!");
      const { token, avatar } = response.data; 
      localStorage.setItem("token", token); 

      // Decode token to get userId and username (ensure your backend adds these to the JWT payload)
      const decodedToken = jwtDecode(token);
      setCurrentUser({
        id: decodedToken.userId, 
        username: decodedToken.username || signInData.email, 
        avatar: avatar
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Sign In failed!");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", signUpData.username);
      formData.append("email", signUpData.email);
      formData.append("password", signUpData.password);
      formData.append("avatar", avatar.file);

      const response = await axios.post("http://localhost:5000/api/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Account created successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign Up failed!");
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleSignIn}>
          <input type="email" placeholder="Email" name="email" value={signInData.email} onChange={handleSignInChange} />
          <input type="password" placeholder="Password" name="password" value={signInData.password} onChange={handleSignInChange} />
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleSignUp}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="avatar" />
            Upload an image
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          <input type="text" placeholder="Username" name="username" value={signUpData.username} onChange={handleSignUpChange} />
          <input type="email" placeholder="Email" name="email" value={signUpData.email} onChange={handleSignUpChange} />
          <input type="password" placeholder="Password" name="password" value={signUpData.password} onChange={handleSignUpChange} />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
