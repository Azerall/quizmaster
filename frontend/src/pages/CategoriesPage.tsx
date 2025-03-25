import {useState, useEffect} from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const categories = [
  "General Knowledge",
  "Books",
  "Film",
  "Music",
  "Television",
  "Video Games",
  "Board Games",
  "Science & Nature",
  "Computers",
  "Mythology",
  "History",
  "Art",
  "Celebrities",
  "Animals",
  "Vehicles",
  "Comics",
  "Japanese Anime & Manga",
  "Cartoon & Animations",
];

interface Category {
  Username: string;
  CategoryName: string;
  Questions: {
    question_text: string;
    responses: string[];
    response_correct: string;
  }[];
}

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { user, fetchFromBackend } = useAuth();

  const [userCategories, setUserCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (user) {
        try {
          //const response = await fetchFromBackend(`/api/user/getUserCategories?username=${user.Username}`, "GET");
          const response = await fetchFromBackend(`/api/user/getUserCategories`, "GET");

          if (!response.ok) throw new Error("Erreur lors de la récupération des catégories.");

          const data = await response.json();
          if (data && data.status === 200) {
            setUserCategories(data.data as Category[]);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchUserCategories();
  }, [user]);

  const handleCategoryClick = (category: string) => {
    navigate(`/quizmaster/quiz`, {
      state: { selectedCategory: category, allCategories: categories },
    });
  };

  const handleModifyCategory = (category: Category) => {
    navigate(`/quizmaster/create-category`, {
      state: { selectedCategory: category },
    });
  }

  return (
    <div className="h-screen pt-[100px] flex flex-col items-center bg-transparent p-10">
      <h1 className="text-[#E470A3] text-4xl font-bold mb-6">Choisissez une catégorie</h1>

      {/* Catégories prédéfinies */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="bg-[#292047] text-white p-4 rounded-xl shadow-lg hover:scale-105 hover:shadow-[0px_4px_15px_rgba(64,196,255,0.6),0px_0px_25px_rgba(64,196,255,0.4)] transition transform duration-200"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Catégories utilisateur */}
      {userCategories.length > 0 && (
        <>
          <h2 className="text-white text-2xl font-bold mt-8 mb-4">Mes catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
          {userCategories.map((category) => (
                <button
                    key={category.CategoryName}
                    onClick={() => handleCategoryClick(category.CategoryName)}
                    className="relative bg-[#292047] text-white p-4 rounded-xl shadow-lg hover:scale-105 hover:shadow-[0px_4px_15px_rgba(64,196,255,0.6),0px_0px_25px_rgba(64,196,255,0.4)] transition transform duration-200"
                >
                    {category.CategoryName}
                    {/* Icône de modification */}
                    {category.Username === user?.Username && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation(); // Empêche le clic de déclencher handleCategoryClick
                                handleModifyCategory(category);
                            }}
                            className="absolute top-1 right-1 p-1 hover:bg-gray-700 rounded-full cursor-pointer"
                            title="Modifier la catégorie"
                        >
                            <img
                                src="/quizmaster/images/modify_category.png"
                                alt="Modifier"
                                className="w-5 h-5"
                            />
                        </span>
                    )}
                </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => navigate("/quizmaster/create-category")}
        className="mt-10 bg-[#E470A3] text-white px-6 py-3 rounded-lg text-lg font-bold hover:scale-105 transition"
        style={{
          background: "linear-gradient(90deg, #E470A3, #9A60D1)",
          boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
        }}
      >
        ➕ Créer une Catégorie Personnalisée
      </button>
    </div>
  );
};

export default CategoriesPage;
