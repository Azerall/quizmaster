import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Assurez-vous que le chemin est correct
import logoutIcon from "../assets/logout.png"; // Ajoutez une image de porte de sortie

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  // Fonction pour vérifier si le lien est actif
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#292047] p-4 flex justify-between items-center">
      {/* Logo et Titre */}
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <span className="text-[#E370A2] text-2xl font-bold chevadisplay-font">QUIZ MASTER ++</span>
      </div>

      {/* Liens de navigation */}
      <div className="flex items-center space-x-6">
        <NavLink to="/" active={isActive("/")}>Accueil</NavLink>
        <NavLink to="/quizzes" active={isActive("/quizzes")}>Quizzes</NavLink>
        <NavLink to="/profil" active={isActive("/profil")}>Profil</NavLink>
        <NavLink to="/gacha" active={isActive("/gacha")}>Gacha</NavLink>

        {/* Bouton Déconnexion avec Icône */}
        <button onClick={handleLogout} className="ml-4">
          <img src={logoutIcon} alt="Déconnexion" className="h-8 w-8 hover:opacity-80 transition-opacity" />
        </button>
      </div>
    </nav>
  );
};

// Composant de lien personnalisé avec effet de surlignement
import { ReactNode } from "react";

const NavLink = ({ to, children, active }: { to: string; children: ReactNode; active: boolean }) => (
  <Link to={to} className={`relative text-white text-lg font-semibold transition-colors ${active ? "!text-[#E370A2]" : "hover:text-pink-300"}`}>
    {children}
    {active && <span className="absolute bottom-0 left-0 w-full h-[5px] bg-[#E370A2] rounded" style={{ marginBottom: '-24px', width: '105%' }}></span>}
  </Link>
);

export default Navbar;
