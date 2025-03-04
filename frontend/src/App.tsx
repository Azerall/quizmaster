import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthForm } from "./pages/AuthForm";
import MainPage from "./pages/MainPage";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { JSX } from "react";
import GachaPage from "./pages/GachaPage";
import ProfilPage from "./pages/ProfilPage";
import CategoriesPage from "./pages/CategoriesPage";
import CreateCategoryPage from "./pages/CreateCategoryPage";
import QuizGame from "./pages/QuizGame";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" />;
}

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <div className="h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <div className="flex-grow overflow-hidden">
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
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/quizzes" element={<CategoriesPage />} />
          <Route path="/create-category" element={<CreateCategoryPage />} />
          <Route path="/quiz/:category" element={<QuizGame />} />
          <Route path="/signin" element={<AuthForm isSignup={false} />} />
          <Route path="/signup" element={<AuthForm isSignup={true} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
