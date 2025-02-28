// const GachaPage = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b">
//       <div className="bg-pink-200 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
//         <img
//           src="/images/gacha_machine.png"
//           alt="Gacha Machine"
//           width={325}
//           height={325}
//           className="rounded-2xl mb-6"
//         />
//       </div>

//       <div className="flex gap-20 mt-8">
//         {/* Conteneur du bouton 100 diamants */}
//         <div className="flex items-center relative">
//           <button className="flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg">
//             <span className="transform scale-130">100</span>
//             <span className="transform scale-130">💎</span>
//             <span className="transform scale-130">| x1</span>
//           </button>

//           <img
//             src="/images/ticket_single.png"
//             alt="Ticket x1"
//             className="w-22 h-22 absolute left-22 top-6 transform translate-x-1/2 -translate-y-1/2"
//           />
//         </div>

//         {/* Conteneur du bouton 900 diamants avec réduction */}
//         <div className="flex items-center relative">
//           <button className="relative flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg">
//             <span className="transform scale-130">900</span>
//             <span className="transform scale-130">💎</span>
//             <span className="transform scale-130">| x10</span>
//             <span className="absolute -top-3 bg-red-600 text-sm font-bold px-2 rounded-md transform scale-130">
//               -10%
//             </span>
//           </button>

//           <img
//             src="/images/ticket_multi.png"
//             alt="Ticket x10"
//             className="w-26 h-26 absolute left-24 top-6 transform translate-x-1/2 -translate-y-1/2"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GachaPage;

import { useState } from "react";

const GachaPage = () => {
  const [reward, setReward] = useState<string | null>(null);

  const handleGachaRoll = (cost: number) => {
    // Simuler un tirage Gacha (ici, un exemple de récompenses aléatoires)
    const rewards = [
      "Carte 3 étoiles 🌟🌟🌟",
      "Carte 4 étoiles 🌟🌟🌟🌟",
      "Carte 5 étoiles 🌟🌟🌟🌟🌟",
    ];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    setReward(randomReward); // Définir la récompense pour afficher le modal
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b">
      <div className="bg-pink-200 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        <img
          src="/images/gacha_machine.png"
          alt="Gacha Machine"
          width={325}
          height={325}
          className="rounded-2xl mb-6"
        />
      </div>

      <div className="flex gap-20 mt-8">
        {/* Bouton 100 diamants */}
        <button
          onClick={() => handleGachaRoll(100)}
          className="flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
        >
          <span className="transform scale-130">100</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x1</span>
        </button>

        {/* Bouton 900 diamants avec réduction */}
        <button
          onClick={() => handleGachaRoll(900)}
          className="relative flex items-center gap-3 bg-yellow-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
        >
          <span className="transform scale-130">900</span>
          <span className="transform scale-130">💎</span>
          <span className="transform scale-130">| x10</span>
          <span className="absolute -top-3 bg-red-600 text-sm font-bold px-2 rounded-md transform scale-130">
            -10%
          </span>
        </button>
      </div>

      {/* MODAL D'AFFICHAGE DES RÉCOMPENSES */}
      {reward && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold">🎉 Félicitations ! 🎉</h2>
            <p className="mt-4 text-lg">{reward}</p>
            <button
              onClick={() => setReward(null)}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md font-bold"
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
