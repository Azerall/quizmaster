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
  return token ? children : <Navigate to="/quizmaster/signin" />;
}

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/quizmaster/signin" || location.pathname === "/quizmaster/signup";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/quizmaster/" element={<Navigate to="/quizmaster/dashboard" />} />
          <Route
            path="/quizmaster/dashboard"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/quizmaster/profil" element={<ProfilPage />} />
          <Route path="/quizmaster/gacha" element={<GachaPage />} />
          <Route path="/quizmaster/quizzes" element={<CategoriesPage />} />
          <Route path="/quizmaster/create-category" element={<CreateCategoryPage />} />
          <Route path="/quizmaster/quiz" element={<QuizGame />} />
          <Route path="/quizmaster/signin" element={<AuthForm isSignup={false} />} />
          <Route path="/quizmaster/signup" element={<AuthForm isSignup={true} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
