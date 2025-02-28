import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
    id: string;
    username: string;
    level: number;
    coins: number;
    inventory: any[];
    stats: {
        playedQuizzes: number;
        winQuizzes: number;
    };
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchUser(token);
        }
    }, [token]);

    const fetchUser = async (token: string) => {
        const response = await fetch("http://localhost:8080/api/user/getUserToken", {
            headers: { "Authorization": token },
        });
        const data = await response.json();
        if (response.ok) {
            setUser(data);
        } else {
            logout();
        }
    };

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
        navigate("/dashboard"); // Redirige après connexion
    };
    
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        navigate("/signin"); // Redirige après déconnexion
    };    

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
