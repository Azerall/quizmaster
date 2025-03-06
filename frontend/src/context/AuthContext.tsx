import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
    ID: string;
    Username: string;
    Experience: number;
    Coins: number;
    Picture: string;
    Inventory: any[];
    Stats: {
        quizzes_played: number;
        quizzes_win: number;
    };
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    updateUser?: (user: User) => void;
    fetchFromBackend: (endpoint: string, method: string, body?: any) => Promise<Response>;
    calculateLevel: (experience: number) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    useEffect(() => {
        if (token) {
            fetchFromBackend("/api/user/getUserToken", "GET").then(async (response) => {
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    logout();
                }
            });
        }
    }, [token]);

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

    const fetchFromBackend = async (endpoint: string, method: string = "GET", body?: any) => {
        if (!token) {
            throw new Error("No token available");
        }
        const options: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        };
        if (body) {
            options.body = body;
        }
        console.log("Envoi de la requête :", { endpoint, method, body });
        return await fetch(`http://localhost:8080${endpoint}`, options);
    };

    // Fonction pour calculer le niveau en fonction de l'expérience
    const calculateLevel = (experience: number) => {
        const level = Math.max(1, Math.floor(2 * Math.log(experience) - 4));
        return level;
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, updateUser, fetchFromBackend, calculateLevel }}>
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
