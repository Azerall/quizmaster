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
      <div className="flex flex-col items-center pt-4 pb-4 flex-grow">
        <div className="relative w-full max-w-sm">
          <div
            className="w-full h-48 bg-cover bg-center rounded-t-lg"
            style={{ backgroundImage: "url('/images/tiles.jpg')" }}
          >
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
              <div
                className="w-30 h-30 rounded-full flex items-center justify-center"
                style={{
                  boxShadow:
                    "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                }}
              >
                <img
                  src={user?.Picture}
                  alt="Profil"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
          {/* Informations du profil */}
          <div className="bg-[#292047] text-white shadow-lg p-6 rounded-b-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#E470A3]">
                {user?.Username}
              </h2>
              <p className="text-[#9A60D1]">
                Niveau : {calculateLevel(user?.Experience)}
              </p>
              <p className="text-[#9A60D1]">
                Crédits : {user?.Coins} 💎
              </p>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow:
                "0 0 15px rgba(64, 196, 255, 0.7), 0 0 30px rgba(64, 196, 255, 0.5)",
              zIndex: -1,
            }}
          />
        </div>
  
        <div className="mt-12">
          <button
            onClick={() => navigate("/quizzes")}
            className="px-12 py-5 text-2xl font-bold text-white rounded-lg transition-transform transform hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #E470A3, #9A60D1)",
              boxShadow:
                "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
            }}
          >
            🎮 JOUER
          </button>
        </div>
  
        <div className="mt-12 w-full max-w-6xl mx-auto bg-[#1E1A33] rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-center mb-5 text-[#E470A3]">
            🏆 Top 5 des meilleurs joueurs
          </h2>
          {!topPlayers.length ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : (
            <ul className="flex justify-center space-x-4">
              {topPlayers.map((player, index) => (
                <li
                  key={index}
                  className="bg-[#292047] rounded-lg p-6 text-white shadow-md border border-[#40C4FF]/50 flex flex-col items-center"
                  style={{
                    boxShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
                    width: "180px",
                  }}
                >
                  <span className="text-sm font-semibold mb-2">
                    #{index + 1}
                  </span>
                  <img
                    src={player.Picture || "/images/profils/default.png"}
                    alt={`${player.Username} profile`}
                    className="w-16 h-16 rounded-full object-cover border border-white mb-2"
                  />
                  <span className="text-sm">{player.Username}</span>
                  <span className="text-[#FFD700] text-sm">
                    ⭐ {calculateLevel(player.Experience)}
                  </span>
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