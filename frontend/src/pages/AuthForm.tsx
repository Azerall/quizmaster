import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthFormProps {
    isSignup: boolean;
}

export const AuthForm = ({ isSignup }: AuthFormProps) => {
    const [Username, setUsername] = useState("");
    const [Password, setPassword] = useState("");
    const { login } = useAuth();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const API_URL = "http://localhost:8080";
        const endpoint = isSignup ? `${API_URL}/api/user/createUser` : `${API_URL}/api/user/login`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Username, Password })
        });

        const data = await response.json();
        if (response.ok) {
            login(data.token);
        } else {
            alert(data.message || "Authentication failed");
        }
    };

    return (
        <div className="auth-container" style={{
                background: "transparent" }}>  
<div
        className="auth-card"
        style={{
          background: "#292047",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
                 
                 <div className="flex items-center justify-center gap-4 mb-6 p-1">
          <img
            src="/src/assets/logo.png"
            alt="Logo Quiz Master"
            className="w-17 h-17 object-contain"
          />
          <span className="text-[#E470A3] text-3xl font-bold chevadisplay-font">
            QUIZ MASTER ++
          </span>
        </div>

                <div className="button-group">
                    <Link to="/signup" className={isSignup ? "active" : ""}>Sign up</Link>
                    <Link to="/signin" className={!isSignup ? "active" : ""}>Sign in</Link>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label style={{ color: "white" }}>Username</label>
                    <input
                        className="w-full p-2 bg-[#292047] border-b-2 border-[#E470A3] text-white outline-none rounded-none focus:ring-2 focus:ring-[#E470A3]/50"
                        type="text"
                        value={Username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label style={{ color: "white" }}>Password</label>
                    <input
                        className="w-full p-2 bg-[#292047] border-b-2 border-[#E470A3] text-white outline-none rounded-none focus:ring-2 focus:ring-[#E470A3]/50"
                        type="password"
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" 
                    className="auth-button"
                        style={{
                            background: "linear-gradient(90deg, #E470A3, #9A60D1)",
                            color: "white",
                            borderRadius: "8px",
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
                            transition: "background-color 0.3s"
                        }}>
                        {isSignup ? "Sign up" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
};
