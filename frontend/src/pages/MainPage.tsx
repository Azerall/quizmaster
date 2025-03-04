import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const MainPage = () => {
  const { user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<{ Username: string; Level: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //fontion pour charger les classements du serveur
  async function fetchTopPlayers () {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/user/getTopPlayers", {
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Impossible de récupérer les meilleurs joueurs.');
      }
      const data = await response.json();
      setTopPlayers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des meilleurs joueurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPlayers();
  }, []);
  
  if (true) {
    console.log(user);
  }

  const [classement] = useState([
    { username: "Joueur A", niveau: 50 },
    { username: "Joueur B", niveau: 45 },
    { username: "Joueur C", niveau: 42 },
  ]);

  const [profil] = useState({
    username: "JoueurX",
    niveau: 38,
    credit: 1200,
    photo: "/images/profils/silver_wolf.png",
  });

  return (
    <div className="h-screen flex flex-col bg-transparent">
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
                className="w-35 h-35 bg-[#E470A3] rounded-full flex items-center justify-center border-4 border-white"
                style={{
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                }}
              >
                <img src={profil.photo} alt="Profil" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
          </div>
          {/* Informations du profil */}
          <div className="bg-[#292047] text-white shadow-lg p-6 rounded-b-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#E470A3]">{user?.Username}</h2>
              <p className="text-[#9A60D1]">Niveau : {user?.Level}</p>
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
        <div className="mt-10 w-full max-w-4xl bg-[#1E1A33] rounded-lg p-8 text-white shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-[#E470A3]">🏆 Top 5 Joueurs</h2>
          {isLoading ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : (
            <ul className="space-y-4">
              {topPlayers.map((player, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-6 py-3 bg-[#292047] rounded-lg shadow-lg"
                  style={{
                    boxShadow: "0 0 12px rgba(255, 215, 0, 0.6)",
                  }}
                >
                  <span className="font-semibold text-lg">#{index + 1} {player.Username}</span>
                  <span className="text-[#FFD700]">⭐ Niveau {player.Level}</span>
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