import { useState } from "react";

const ProfilPage = () => {
  const [profil, setProfil] = useState({
    username: "JoueurX",
    niveau: 38,
    credit: 1200,
    photo: "/images/profils/kafka.png",
  });

  const [editUsername, setEditUsername] = useState(false); // Mode édition pour le username
  const [editPhoto, setEditPhoto] = useState(false); // Mode édition pour la photo
  const [newUsername, setNewUsername] = useState(profil.username);
  const [newPhoto, setNewPhoto] = useState(profil.photo); // Gestion des photos prédéfinies

  // Liste des photos disponibles dans /images/profils/
  const profileImages = [
    "/images/profils/kafka.png",
    "/images/profils/blade.png",
    "/images/profils/silver_wolf.png",
  ];

  // Données statiques (vous pouvez les connecter à une API ou une base de données)
  const [inventory] = useState<{ rarity: string; image: string; quantity: number }[]>([
    { rarity: "Rare", image: "/images/cheatsheets/rarity3.png", quantity: 3 },
    { rarity: "Épique", image: "/images/cheatsheets/rarity4.png", quantity: 2 },
    { rarity: "Légendaire", image: "/images/cheatsheets/rarity5.png", quantity: 1 },
  ]);
  const [stats] = useState({
    playedQuizzes: 150,
    winQuizzes: 95,
  });

  // Fonction pour sauvegarder les modifications du username
  const handleSaveUsername = () => {
    setProfil({
      ...profil,
      username: newUsername,
    });
    setEditUsername(false);
  };

  // Fonction pour sauvegarder les modifications de la photo
  const handleSavePhoto = () => {
    setProfil({
      ...profil,
      photo: newPhoto,
    });
    setEditPhoto(false);
  };

  return (
    <div className="h-screen flex flex-col bg-transparent">
      {/* Contenu principal */}
      <div className="flex flex-col items-center pt-8 pb-8 flex-grow">
        <div className="relative w-full max-w-2xl">
          {/* Partie haute avec tiles.jpg et options d'images */}
          <div
            className="w-full h-48 bg-cover bg-center rounded-t-lg relative"
            style={{ backgroundImage: "url('/images/tiles.jpg')" }}
          >
            {/* Image de profil centrée cliquable */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
              <div
                className="w-35 h-35 bg-[#E470A3] rounded-full flex items-center justify-center border-4 border-white cursor-pointer"
                onClick={() => setEditPhoto(!editPhoto)} // Ouvre l'édition pour la photo
                style={{
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                }}
              >
                <img
                  src={newPhoto}
                  alt="Profil"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Options d'images à droite de l'image de profil (visible en mode édition de photo) */}
            {editPhoto && (
              <div className="absolute top-16 right-6 flex gap-2">
                {profileImages.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Option ${image.split('/').pop()?.split('.').shift() || "Photo"}`}
                    className="w-18 h-18 rounded-full object-cover border-2 border-transparent cursor-pointer hover:border-[#E470A3]"
                    onClick={() => {
                      setNewPhoto(image);
                      handleSavePhoto(); // Sauvegarde immédiate et ferme l'édition
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informations et sections du profil */}
          <div
            className="shadow-lg rounded-b-lg p-6"
            style={{
              background: "#292047", // Fond statique
            }}
          >
            {/* Section Profil */}
            <div className="text-center mb-6 relative">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 ml-9">
                  {editUsername ? (
                    <>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Nouveau nom d'utilisateur"
                        className="text-3xl font-bold text-[#E470A3] bg-transparent border-b-2 border-[#4A2E7A] outline-none w-full max-w-md text-center p-0"
                      />
                      <button
                        onClick={handleSaveUsername}
                        className="bg-[#E470A3] hover:bg-[#D65F8F] text-white rounded-lg px-2 py-2"
                      >
                        <img src="/images/modify.png" alt="Sauvegarder" className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-[#E470A3]">{profil.username}</h2>
                      <button
                        onClick={() => setEditUsername(true)}
                        className="bg-transparent text-white hover:text-[#E470A3] p-1 cursor-pointer"
                      >
                        <img src="/images/modify.png" alt="Modifier" className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[#9A60D1] text-lg">Niveau : {profil.niveau}</p>
              <p className="text-[#9A60D1] text-lg">Crédits : {profil.credit} 💎</p>
            </div>

            {/* Sections supplémentaires avec barre verticale */}
            <div className="grid grid-cols-2 gap-8 mt-6 relative">
              {/* Inventory */}
              <div className="p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#E470A3] mb-2">Inventaire</h3>
                <div className="flex flex-col gap-4">
                  {inventory.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={`Cheat ${index + 1}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <span className="text-white text-sm">
                        {item.rarity} (x{item.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 rounded-lg ml-4"> {/* Ajout de ml-4 pour décaler vers la droite */}
                <h3 className="text-xl font-bold text-[#E470A3] mb-2">Statistiques</h3>
                <p className="text-white">Quizzes joués : {stats.playedQuizzes}</p>
                <p className="text-white">Quizzes gagnés : {stats.winQuizzes}</p>
              </div>

              {/* Barre verticale blanche contenue dans les sections */}
              <div className="absolute top-3 left-1/2 w-1 bg-white transform -translate-x-1/2 pointer-events-none"
                style={{
                  height: "93%",
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                  backgroundColor: "rgba(255, 255, 255, 1)", // Assure une opacité complète
                }}
              />
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
      </div>
    </div>
  );
};

export default ProfilPage;