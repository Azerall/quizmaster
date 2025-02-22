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
        <div className="auth-container">
            <div className="auth-card">
                <div className="button-group">
                <Link to="/signup" className={isSignup ? "active" : ""}>Sign up</Link>
                <Link to="/signin" className={!isSignup ? "active" : ""}>Sign in</Link>
                </div>

                <h2 className="auth-title">{isSignup ? "Sign up" : "Sign in"}</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={Username} 
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input 
                        type="password" 
                        value={Password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="auth-button">
                        {isSignup ? "Sign up" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
};
