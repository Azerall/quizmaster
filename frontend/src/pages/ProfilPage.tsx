import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilPage = () => {
  const { user, updateUser, fetchFromBackend, calculateLevel } = useAuth();

  const [editUsername, setEditUsername] = useState(false);
  const [editPicture, setEditPicture] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [profileImages, setProfileImages] = useState<string[]>([]);

  useEffect(() => {
    // Importer toutes les images de profils
    const images = import.meta.glob('/src/assets/profils/*.{png,jpg,jpeg,gif}', { eager: true });
    const imageUrls = Object.values(images).map((mod: any) => mod.default);
    setProfileImages(imageUrls);
  }, []);

  useEffect(() => {
    setNewUsername(user?.Username || "");
  }, [user]);

  const handleSaveUsername = async () => {
    if (updateUser && newUsername && user?.ID) {
      try {
        const response = await fetchFromBackend(`/api/user/changeUsername/${user.ID}`, "PUT", JSON.stringify({
          newUsername: newUsername,
        }));

        if (response.ok) {
          const data = await response.json();
          console.log(data);
        }
        updateUser({
          ...user,
          Username: newUsername,
        });
      } catch (error) {
        console.error(error);
      }
    }
    setEditUsername(false);
  };

  const handleSavePicture = async (newPicture: string) => {
    if (updateUser && user?.ID) {
      try {
        const response = await fetchFromBackend(`/api/user/changePicture/${user.ID}`, "PUT", JSON.stringify({
          newPicture: newPicture,
        }));
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          updateUser({
            ...user,
            Picture: newPicture,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    setEditPicture(false);
  };

  return (
    <div className="h-screen pt-[100px] flex flex-col bg-transparent">
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
                className="w-35 h-35 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setEditPicture(!editPicture)} // Ouvre l'édition pour la photo
                style={{
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                }}
              >
                <img
                  src={user?.Picture}
                  alt="Profil"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            {editPicture && (
              <div className="absolute top-14 right-4 w-[calc(35%)] h-21 overflow-x-auto flex gap-3 p-2 pl-3 pr-3 bg-[#292047] rounded-lg shadow-lg border border-[#9A60D1]"
                style={{
                  boxShadow: "0 0 15px rgba(64, 196, 255, 0.7), 0 0 30px rgba(64, 196, 255, 0.5)",
                }}
              >
                {/* Image actuelle de l'utilisateur en premier avec lueur néon blanche */}
                {user?.Picture && (
                  <img
                    key={user.Picture}
                    src={user.Picture}
                    alt={`Option courante ${user.Picture.split('/').pop()?.split('.').shift() || "Photo"}`}
                    className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    style={{
                      boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 255, 255, 0.8)",
                    }}
                    onClick={() => {
                      setEditPicture(!editPicture);
                    }}
                  />
                )}
                {/* Autres images, filtrées pour exclure l'image actuelle */}
                {profileImages
                  .filter(image => image !== user?.Picture)
                  .map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt={`Option ${image.split('/').pop()?.split('.').shift() || "Photo"}`}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer hover:border-white"
                      onClick={() => {
                        handleSavePicture(image);
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
              background: "#292047",
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
                        className="text-3xl font-bold text-[#E470A3] bg-transparent border-b-2 border-[#E470A3] outline-none w-full max-w-md text-center p-0"
                      />
                      <button
                        onClick={handleSaveUsername}
                        className="bg-[#E470A3] hover:bg-[#D65F8F] text-white rounded-lg px-2 py-2"
                      >
                        <img src="/images/modify.png" alt="✏" className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-[#E470A3]">{user?.Username}</h2>
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
              <p className="text-[#9A60D1] text-lg">Niveau : {calculateLevel(user?.Experience)}</p>
              <p className="text-[#9A60D1] text-lg">Crédits : {user?.Coins} 💎</p>
            </div>

            {/* Sections supplémentaires avec barre verticale */}
            <div className="grid grid-cols-2 gap-8 mt-6 relative">
              {/* Inventory */}
              <div className="p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#E470A3] mb-2">Inventaire</h3>
                <div className="flex flex-col gap-4">
                  {user?.Inventory.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={`/images/cheatsheets/rarity${item.rarity}.png`}
                        alt={`Cheat ${index + 1}`}
                        className="w-16 h-16 object-cover"
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
                <p className="text-white">Quizzes joués : {user?.Stats.quizzes_played}</p>
                <p className="text-white">Réponses correctes : {user?.Stats.correct_responses}</p>
                <p className="text-white">Notes parfaites : {user?.Stats.full_marks}</p>
                <p className="text-white">Antisèches utilisées : {user?.Stats.used_cheat_sheets}</p>
              </div>

              {/* Barre verticale blanche contenue dans les sections */}
              <div className="absolute top-3 left-1/2 w-1 bg-white transform -translate-x-1/2 pointer-events-none"
                style={{
                  height: "93%",
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.8)",
                  backgroundColor: "rgba(255, 255, 255, 1)", 
                }}
              />
            </div>
          </div>

          {/* Pseudo-élément pour la lueur courbée */}
          <div className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: "0 0 15px rgba(64, 196, 255, 0.7), 0 0 30px rgba(64, 196, 255, 0.5)",
              zIndex: -1,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;