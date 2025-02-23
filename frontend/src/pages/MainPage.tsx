const MainPage = () => {
  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold">Bienvenue sur Quiz Master ++</h1>
      <button className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
        JOUER
      </button>
      <div className="mt-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold">Classement des joueurs</h2>
        <ul className="bg-white shadow-md p-4 rounded-lg">
          <li>1. Joueur A - 5000 pts</li>
          <li>2. Joueur B - 4500 pts</li>
          <li>3. Joueur C - 4200 pts</li>
        </ul>
      </div>
    </div>
  );
};

export default MainPage;

