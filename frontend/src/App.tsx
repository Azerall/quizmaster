import { Routes, Route, Navigate } from "react-router-dom";
import { AuthForm } from "./pages/AuthForm";
import MainPage from "./pages/MainPage";
import { useAuth } from "./context/AuthContext";
import { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/signin" />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                } 
            />
            <Route path="/signin" element={<AuthForm isSignup={false} />} />
            <Route path="/signup" element={<AuthForm isSignup={true} />} />
        </Routes>
    );
}

export default App;
