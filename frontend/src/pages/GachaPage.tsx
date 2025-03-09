import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const GachaPage = () => {
  const { user, updateUser, fetchFromBackend } = useAuth();
  const [truePull, setTruePull] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (truePull.length > 0) {
      if (user && updateUser) {
        const updatedCoins = user?.Coins - (quantity === 1 ? 100 : 900);

        // Count rarities from truePull
        const rarityCounts = truePull.reduce((acc, rarity) => {
          acc[rarity] = (acc[rarity] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        const updatedInventory = user.Inventory.map((item) => ({
          ...item,
          quantity: item.quantity + (rarityCounts[item.rarity] || 0),
        }));

        updateUser({
          ...user,
          Coins: updatedCoins,
          Inventory: updatedInventory,
        });
      }
    }
  }, [truePull]);

  const handlePull = async (e: { preventDefault: () => void } | null, qty: number) => {
    if (e) e.preventDefault();
    setQuantity(qty);

    const response = await fetchFromBackend("/api/gacha/pull", "POST", JSON.stringify({ username: user?.Username, quantity: qty }));
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
    <div className="h-screen pt-[100px] flex flex-col items-center bg-[url('/images/gacha_background.png')] bg-cover bg-center p-10">
      <h1 className="text-[#E470A3] text-4xl font-bold mb-6">Gacha</h1>

      {/* Machine Gacha */}
      <div className="p-8 flex flex-col items-center relative">
        
      {/* Affichage des coins dans un fond circulaire */}
      <div
        className="absolute -top-15 -left-50 rounded-full flex items-center justify-center"
        style={{
          background: "url('/images/coins_background.png') no-repeat center/cover",
          width: "175px",
          height: "175px"
        }}
      >
        <span className="text-lg pt-2 pl-3 font-bold text-[#E470A3]">{user?.Coins}</span>
        <span>💎</span>
      </div>

        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/gold_background2.png')] bg-no-repeat bg-cover z-10"></div>
        <div
          className="p-15 top-5 flex flex-col items-center relative z-0"
          style={{
            backgroundImage: `url('/images/gold_background.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <img
            src="/images/gacha_machine.png"
            alt="Gacha Machine"
            width={325}
            height={325}
            className="rounded-2xl mb-6 transform scale-140"
          />
        </div>
      </div>

      {/* Boutons de tirage */}
      <div className="flex gap-20 mt-8">
        <button
          onClick={() => handlePull(new Event("click"), 1)}
          className="flex items-center gap-3 bg-[#E470A3] text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-[#D65F8F] hover:shadow-xl transition duration-300"
          style={{
            boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
          }}
        >
          <span className="transform scale-130">100</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x1</span>
        </button>

        <button
          onClick={() => handlePull(new Event("click"), 10)}
          className="relative flex items-center gap-3 bg-[#E470A3] text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-[#D65F8F] hover:shadow-xl transition duration-300"
          style={{
            boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
          }}
        >
          <span className="transform scale-130">900</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x10</span>
          <span className="absolute -top-3 bg-[#9A60D1] text-white text-sm font-bold px-2 rounded-md transform scale-130">
            -10%
          </span>
        </button>
      </div>

      {/* Pop-up d'erreur */}
      {errorMessage && (
        <div className="fixed inset-0 flex items-start justify-center pt-80 z-50">
          <div
            className="relative bg-[#292047] p-6 rounded-lg shadow-lg text-center w-80"
            style={{
              boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
            }}
          >
            <h2 className="text-[#E470A3] text-2xl font-bold">Erreur</h2>
            <p className="mt-4 text-white">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-6 bg-[#E470A3] text-white px-6 py-2 rounded-md font-bold hover:bg-[#D65F8F] transition duration-300"
              style={{
                boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Affichage des récompenses */}
      {truePull.length > 0 && !errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-[#292047] p-8 rounded-lg shadow-lg text-center"
            style={{
              boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
            }}
          >
            <h2 className="text-[#E470A3] text-2xl font-bold">✨ Félicitations ! ✨</h2>
            <div className="flex justify-center mt-7 mb-3 gap-4 flex-wrap" style={{ maxWidth: "40rem" }}>
              {truePull.map((reward, index) => {
                const rarityStyles = {
                  3: {
                    background: "#cd7f32", // Bronze
                    boxShadow: "0 0 15px rgba(205, 127, 50, 0.8), 0 0 30px rgba(205, 127, 50, 0.8)",
                  },
                  4: {
                    background: "#c0c0c0", // Silver
                    boxShadow: "0 0 15px rgba(192, 192, 192, 0.8), 0 0 30px rgba(192, 192, 192, 0.8)",
                  },
                  5: {
                    background: "#ffd700", // Gold
                    boxShadow: "0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.8)",
                  },
                  6: {
                    background: "#4B0082", // Indigo
                    boxShadow: "0 0 15px rgba(75, 0, 130, 0.8), 0 0 30px rgba(75, 0, 130, 0.8)",
                  },

                };

                const style = rarityStyles[reward as 3 | 4 | 5 | 6] || rarityStyles[5]; // Default to gold if reward is out of range

                return (
                  <img
                    key={index}
                    src={`/images/cheatsheets/rarity${reward === 6 ? 'AI' : reward}.png`}
                    alt={`Reward ${reward}`}
                    className="w-24 h-24 m-2 rounded-lg shadow-md"
                    style={style}
                  />
                );
              })}
            </div>
            <button
              onClick={() => setTruePull([])}
              className="mt-6 bg-[#E470A3] text-white px-6 py-2 rounded-md font-bold hover:bg-[#D65F8F] transition duration-300"
              style={{
                boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaPage;
