import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";

interface Question {
  question_text: string;
  responses: string[];
}

const QuizGame = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCategory, allCategories } = location.state || {};
  const [method, setMethod] = useState("");
  const [quizType, setQuizType] = useState("");

  const [quizID, setQuizID] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [choices, setChoices] = useState<string[]>([]);  // Choix des réponses
  const [correctAnswer, setCorrectAnswer] = useState<string>("");  // Réponse correcte
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);  // Typé à string ou null
  const [hasUsedCheatsheet, setHasUsedCheatsheet] = useState<boolean>(false);
  const [cheatsheet, setCheatsheet] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [mark, setMark] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);


  useEffect(() => {
    if (selectedCategory && allCategories) {
      if (allCategories.includes(selectedCategory)) {
        setQuizType("getQuizByExternalAPI");
        setMethod("GET");
      } else {
        setQuizType("createQuiz");
        setMethod("POST");
      }
    }
  }, [selectedCategory, allCategories]);

  useEffect(() => {
    if (quizType && method) {
      handleQuiz();
    }
  }, [quizType, method]);

  const handleQuiz = async () => {
    const API_URL = "http://localhost:8080";
    let endpoint = `${API_URL}/api/quiz/${quizType}/${selectedCategory}`;

    if (method === "GET") {
      endpoint += `?username=${encodeURIComponent(user?.Username || "")}&categoryname=${encodeURIComponent(selectedCategory)}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${data.message}`);
      }

      setQuestionNumber(data.data.Number_question);
      setQuestions(data.data.Questions);
      setChoices(data.data.Questions[data.data.Number_question].responses); 
      setCorrectAnswer(data.data.Questions[data.data.Number_question].response_correct);
      setQuizID(data.data.ID);
      setSelectedChoice(null);
    } catch (error) {
      console.error("=== Erreur lors de la requête:", error);
    }
  };

  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(choice);  
  };

  const handleVerify = async () => {
    const API_URL = "http://localhost:8080";
    const endpoint = `${API_URL}/api/quiz/verifyAnswer`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizID: quizID,
        answer: selectedChoice,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data) {
        setIsAnswerChecked(true);
        setCorrectAnswer(data.data);
        console.log("vrai reponse correcte", data.data);
      }

    } else {
      alert(data.message);
    }
  };


  


  const handleNextQuestion = () => {
    if (selectedChoice === correctAnswer) {
      setMark(mark + 1);
    }

    if (questionNumber < questions.length - 1) {
      setQuestionNumber(questionNumber + 1);
      setChoices(questions[questionNumber].responses); 
      setSelectedChoice(null);
      setIsAnswerChecked(false); // Réinitialise l'état de vérification
      setHasUsedCheatsheet(false);
      setCheatsheet([]);
      setCorrectAnswer("");
    } else {
      // navigate("/dashboard");
      setShowResults(true);
    }
  };


  const handleUseCheatsheet = (index: number) => {
    if (!hasUsedCheatsheet && user) {  // Vérifie que l'utilisateur existe
      const updatedInventory = [...user!.Inventory];
      if (updatedInventory[index].quantity > 0) {
        updatedInventory[index].quantity -= 1;

        updateUser({ ...user, Inventory: updatedInventory });
  
        setHasUsedCheatsheet(true);
        handleCheatSheet(index);
      }
    }
  };
  

  const handleCheatSheet = async (rarity: number) => {
    const API_URL = "http://localhost:8080";
    const endpoint = `${API_URL}/api/cheatsheet`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizID: quizID,
          rarity: rarity + 3, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${data.message}`);
      }
      console.log("Indices reçus:", data);
      setCheatsheet(data.data);

    } catch (error) {
      console.error("=== Erreur lors de la requête:", error);
    }
  };

  
  useEffect(() => {
    if (questions.length > 0 && questionNumber < questions.length) {
      setChoices(questions[questionNumber].responses); 
      setSelectedChoice(null);
    }
  }, [questionNumber, questions]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center bg-white p-10 border border-gray-300 max-w-4xl w-full rounded-lg shadow-lg">
        {!quizID ? (
          <p className="text-lg mb-6 text-center max-w-2xl bg-gray-50 p-4 rounded shadow-md">
            Chargement en cours...
          </p>
        ) : showResults ? (
          // Affichage des résultats
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Résultat</h2>
            <p className="text-lg mb-6">
              Vous avez {mark} / {questions.length} bonnes réponses !
            </p>
            <button
              className="py-3 px-6 text-lg font-semibold rounded shadow-md bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => navigate("/dashboard")}
            >
              Terminer
            </button>
          </div>
        ) :
        
        (
          <>
            <h1 className="text-2xl font-bold mb-4">Question n°{questionNumber + 1}</h1>
            <p className="text-lg mb-6 text-center max-w-2xl bg-gray-50 p-4 rounded shadow-md">
              {questions[questionNumber]?.question_text}  {/* Vérifie si la question existe avant de l'afficher */}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {choices.map((choice, index) => {
                const isDisabled = cheatsheet.includes(choice); // Vérifie si la réponse est dans le cheatsheet
                return (
                  <button
                    key={index}
                    className={`py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200
                      ${
                        isAnswerChecked
                          ? choice === correctAnswer
                            ? "bg-green-500 text-white" // Bonne réponse en vert
                            : "bg-red-500 text-white" // Mauvaise réponse en rouge
                          : isDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed" // Désactivé
                          : selectedChoice === choice
                          ? "bg-blue-500 text-white" // Sélection normale
                          : "bg-white hover:bg-gray-200"
                      }`}
                    onClick={() => !isDisabled && handleChoiceClick(choice)}
                    disabled={isDisabled}
                  >
                    {choice}
                  </button>

                );
              })}

            </div>

            <div className="mt-6 flex gap-4">
              {/* Bouton Vérifier */}
              <button
                className={`py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200 ${
                  selectedChoice && !isAnswerChecked ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                onClick={handleVerify}
                disabled={!selectedChoice || isAnswerChecked}
              >
                Vérifier
              </button>

              {/* Bouton Continuer */}
              <button
                className={`py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200 ${
                  isAnswerChecked ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                onClick={handleNextQuestion}
                disabled={!isAnswerChecked}
              >
                Continuer
              </button>
            </div>

          </>
        )}
      </div>

      {/* Cheatsheet à droite */}
      <ul className="mt-6 space-y-4 ml-10">
        {user?.Inventory?.map((cheatsheet, index) => (
          <li key={index} className="flex items-center p-4 bg-gray-100 rounded shadow-md">
            <div className="mr-4">
              <img src={`/images/cheatsheets/rarity${cheatsheet.rarity}.png`} alt="Cheatsheet" className="w-16 h-16" />
            </div>
            <div>
              <p><strong>x</strong>{cheatsheet.quantity}</p>
              <button
                className={`mt-2 py-1 px-3 text-sm font-semibold rounded shadow-md transition-all duration-200 ${
                  (hasUsedCheatsheet || cheatsheet.quantity < 1) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}                
                onClick={() => handleUseCheatsheet(index)}
                disabled={hasUsedCheatsheet || cheatsheet.quantity < 1}
              >
                Utiliser
              </button>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default QuizGame;
