import {useState, useEffect} from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const categories = [
  "General Knowledge",
  "Books",
  "Film",
  "Music",
  "Musicals & Theatres",
  "Television",
  "Video Games",
  "Board Games",
  "Science & Nature",
  "Computers",
  "Mathematics",
  "Mythology",
  "Sports",
  "History",
  "Politics",
  "Art",
  "Celebrities",
  "Animals",
  "Vehicles",
  "Comics",
  "Gadgets",
  "Japanese Anime & Manga",
  "Cartoon & Animations",
];

const CategoriesPage = () => {
  const { user, token } = useAuth();
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (!token || !user?.Username) return;

      try {
        const response = await fetch(`http://localhost:8080/api/user/getUserCategories?username=${user.Username}`, {
          headers: { Authorization: token },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des catégories.");

        const data = await response.json();
        setUserCategories(data.map((item: { CategoryName: string }) => item.CategoryName));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserCategories();
  }, [token, user]);

  const handleCategoryClick = (category: string) => {
    navigate(`/quiz/${category}`, {
      state: { selectedCategory: category, allCategories: categories },
    });
  };

  return (
    <div className="h-screen flex flex-col items-center bg-transparent p-10">
      <h1 className="text-white text-4xl font-bold mb-6">Choisissez une Catégorie</h1>

      {/* Catégories prédéfinies */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="bg-[#292047] text-white p-4 rounded-xl shadow-lg hover:scale-105 transition transform duration-200"
            style={{
              boxShadow:
                "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Catégories utilisateur */}
      {userCategories.length > 0 && (
        <>
          <h2 className="text-white text-2xl font-bold mt-8 mb-4">Vos Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
            {userCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="bg-[#292047] text-white p-4 rounded-xl shadow-lg hover:scale-105 transition transform duration-200"
                style={{
                  boxShadow:
                    "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => navigate("/create-category")}
        className="mt-4 bg-[#E470A3] text-white px-6 py-3 rounded-lg text-lg font-bold hover:scale-105 transition"
        style={{
          boxShadow:
            "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
        }}
      >
        ➕ Créer une Catégorie Personnalisée
      </button>
    </div>
  );
};

export default CategoriesPage;
