import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthForm } from "./pages/AuthForm";
import MainPage from "./pages/MainPage";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { JSX } from "react";
import GachaPage from "./pages/GachaPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/signin" />;
}

function App() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/signin" || location.pathname === "/signup";

    return (
        <div>
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    } 
                />
                <Route path="/gacha" element={<GachaPage />} />
                <Route path="/signin" element={<AuthForm isSignup={false} />} />
                <Route path="/signup" element={<AuthForm isSignup={true} />} />
            </Routes>
        </div>
    );
}

export default App;
