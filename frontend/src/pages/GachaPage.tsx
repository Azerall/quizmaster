import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const GachaPage = () => {
  const { user, updateUser } = useAuth();
  const [truePull, setTruePull] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    if (truePull.length > 0) {
      // Simuler la mise à jour des Coins de l'utilisateur après un tirage
      const updatedCoins = user?.Coins - (quantity === 1 ? 100 : 900);
      // Mettez à jour l'utilisateur avec les nouveaux Coins
      // Assurez-vous que vous avez une fonction pour mettre à jour l'utilisateur dans votre contexte Auth
      updateUser({ ...user, Coins: updatedCoins });
    }
  }, [truePull]);

  const handlePull = async (e: { preventDefault: () => void } | null, qty: number) => {
    if (e) e.preventDefault();
    setQuantity(qty);
    const API_URL = "http://localhost:8080";
    const endpoint = `${API_URL}/api/gacha/pull`;
  
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user?.Username, quantity: qty }), // On envoie `qty`
    });
  
    const data = await response.json();
    if (response.ok) {
      setTruePull(data.data);
      console.log("truePull mis à jour:", data.data);
      setErrorMessage(null);
    } else {
      console.error(data.message);
      setErrorMessage(data.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b">
      {/* Affichage des coins */}
      <div className="absolute top-5 right-5 mt-20 mr-10 bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <span className="text-lg font-bold">{user?.Coins}</span>
        <span>💎</span>
      </div>

      {/* Machine Gacha */}
      <div className="bg-pink-200 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        <img
          src="/images/gacha_machine.png"
          alt="Gacha Machine"
          width={325}
          height={325}
          className="rounded-2xl mb-6"
        />
      </div>

      {/* Boutons de tirage */}
      <div className="flex gap-20 mt-8">
        <button
          onClick={() => {
            handlePull(new Event("click"),1);
          }}
          className="flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-yellow-600 hover:shadow-xl transition duration-300"
        >
          <span className="transform scale-130">100</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x1</span>
        </button>

        <button
          onClick={() => {
            handlePull(new Event("click"),10);
          }}
          className="relative flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg font-bold shadow-lg hover:bg-yellow-600 hover:shadow-xl transition duration-300"
        >
          <span className="transform scale-130">900</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x10</span>
          <span className="absolute -top-3 bg-red-600 text-sm font-bold px-2 rounded-md transform scale-130">
            -10%
          </span>
        </button>
      </div>

      {/* Affichage des récompenses */}

      {errorMessage ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold">Erreur</h2>
            <p className="mt-4 text-lg">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-600 transition duration-300">
              OK
            </button>
          </div>
        </div>
      ) : (
        truePull.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold">🎉 Félicitations ! 🎉</h2>
              <div className="flex justify-center mt-4">
                {truePull.map((reward, index) => (
                  <img
                    key={index}
                    src={`/images/cheatsheets/rarity${reward}.png`}
                    alt={`Reward ${reward}`}
                    className="w-24 h-24 m-2 rounded-lg shadow-md"
                  />
                ))}
              </div>
              <button
                onClick={() => setTruePull([])}
                className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-600 transition duration-300">
                OK
              </button>
            </div>
          </div>
        )
      )}

    </div>
  );
};

export default GachaPage;
