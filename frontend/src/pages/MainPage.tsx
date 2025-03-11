import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const { user, fetchFromBackend, calculateLevel } = useAuth();

  if (user) console.log(user);

  const [topPlayers, setTopPlayers] = useState<{ Username: string; Experience: number; Picture: string }[]>([]);

  useEffect(() => {
    fetchTopPlayers();
  }, []);

  // Fonction pour récupérer les meilleurs joueurs
  async function fetchTopPlayers() {
    try {
      const response = await fetchFromBackend("/api/user/getTopPlayers", "GET");

      if (response.ok) {
        const data = await response.json();
        setTopPlayers(data);
      } else {
        throw new Error("Impossible de récupérer les meilleurs joueurs.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des meilleurs joueurs:", error);
    }
  }

  return (
    <div className="h-screen pt-[100px] flex flex-col bg-transparent">
      {/* Contenu principal */}
      <div className="flex flex-col items-center pt-8 pb-4 flex-grow">
        <div className="relative w-full max-w-md">
          {/* Partie haute avec tiles.jpg */}
          <div
            className="w-full h-48 bg-cover bg-center rounded-t-lg"
            style={{ backgroundImage: "url('/images/tiles.jpg')" }}
          >
            {/* Image de profil centrée */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
              <div
                className="w-35 h-35 rounded-full flex items-center justify-center"
                style={{
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                }}
              >
                <img src={user?.Picture} alt="Profil" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
          </div>
          {/* Informations du profil */}
          <div className="bg-[#292047] text-white shadow-lg p-6 rounded-b-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#E470A3]">{user?.Username}</h2>
              <p className="text-[#9A60D1]">Niveau : {calculateLevel(user?.Experience)}</p>
              <p className="text-[#9A60D1]">Crédits : {user?.Coins} 💎</p>
            </div>
          </div>
          {/* Pseudo-élément pour la lueur courbée */}
          <div className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: "0 0 15px rgba(64, 196, 255, 0.7), 0 0 30px rgba(64, 196, 255, 0.5)",
              zIndex: -1, // Derrière le contenu
            }}
          />
        </div>

        {/* Bouton JOUER */}
        <div className="mt-12">
          <button
            onClick={() => navigate("/quizzes")}
            className="px-10 py-4 text-xl font-bold text-white rounded-lg transition-transform transform hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #E470A3, #9A60D1)",
              boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
            }}
          >
            🎮 JOUER
          </button>
        </div>

        {/* Classement des meilleurs joueurs */}
        <div
          className="fixed top-24 left-7 w-80 bg-[#1E1A33] rounded-lg p-5 text-white shadow-lg border border-[#40C4FF]/50"
          style={{
            boxShadow: "0 0 10px rgba(64, 196, 255, 0.7), 0 0 20px rgba(64, 196, 255, 0.5)"
          }}
        >
          <h2 className="text-lg font-bold text-center mb-3 text-[#E470A3]">🏆 Top 5 des meilleurs joueurs</h2>

          {!topPlayers.length ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : (
            <ul className="space-y-2">
              {topPlayers.map((player, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 bg-[#292047] rounded-md"
                  style={{
                    boxShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={player.Picture || "/images/profils/default.png"} // Chemin par défaut si Picture est undefined
                      alt={`${player.Username} profile`}
                      className="w-10 h-10 rounded-full object-cover border border-white"
                    />
                    <span className="text-sm font-semibold">#{index + 1} {player.Username}</span>
                  </div>
                  <span className="text-[#FFD700] text-sm">⭐ {calculateLevel(player.Experience)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>
    </div>
  );
};

export default MainPage;