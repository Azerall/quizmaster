import { useState } from "react";

const MainPage = () => {
  // Données fictives en attendant les requêtes backend
  const [classement] = useState([
    { username: "Joueur A", niveau: 50 },
    { username: "Joueur B", niveau: 45 },
    { username: "Joueur C", niveau: 42 },
  ]);

  const [profil] = useState({
    username: "JoueurX",
    niveau: 38,
    credit: 1200,
    photo: "https://via.placeholder.com/100", // Image temporaire
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-transparent">
      {/* Contenu principal */}
      <div className="flex w-full max-w-5xl justify-between gap-8">
        {/* Classement (à gauche) */}
        <div className="w-1/3 bg-[#292047] text-white shadow-lg p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🏆 Classement des joueurs</h2>
          <ul>
            {classement.map((player, index) => (
              <li key={index} className="py-1">
                {index + 1}. {player.username} - Niveau {player.niveau}
              </li>
            ))}
          </ul>
        </div>

        {/* Profil (au centre, en haut, avec fond) */}
        <div className="flex flex-col items-center w-1/3 bg-[#292047] text-white shadow-lg p-6 rounded-lg">
          <img src={profil.photo} alt="Profil" className="w-24 h-24 rounded-full border-4 border-[#E470A3] mb-4" />
          <h2 className="text-2xl font-bold">{profil.username}</h2>
          <p className="text-gray-300">Niveau : {profil.niveau}</p>
          <p className="text-gray-300">Crédits : {profil.credit} 🪙</p>
        </div>
      </div>

      {/* Bouton JOUER bien centré en bas */}
      <button
        className="mt-8 px-10 py-4 text-xl font-bold text-white rounded-lg transition-transform transform hover:scale-105"
        style={{
          background: "linear-gradient(90deg, #E470A3, #9A60D1)",
          boxShadow: "0px 4px 10px rgba(228, 112, 163, 0.5)",
        }}
      >
        🎮 JOUER
      </button>
    </div>
  );
};

export default MainPage;
