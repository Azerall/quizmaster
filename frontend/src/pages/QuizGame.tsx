import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface Question {
  question_text: string;
  responses: string[];
}

const QuizGame = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, updateUser, fetchFromBackend } = useAuth();
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

  useEffect(() => {
    if (questions.length > 0 && questionNumber < questions.length) {
      setChoices(questions[questionNumber].responses);
      setSelectedChoice(null);
    }
  }, [questionNumber, questions]);

  const handleQuiz = async () => {
    let endpoint = `/api/quiz/${quizType}/${selectedCategory}`;
    if (method === "GET") {
      endpoint += `?username=${encodeURIComponent(user?.Username || "")}&categoryname=${encodeURIComponent(selectedCategory)}`;
    }

    try {
      const response = await fetchFromBackend(endpoint, method);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${data.message}`);
      }
      console.log("Données reçues:", data);
      setQuestionNumber(data.data.Number_question);
      setQuestions(data.data.Questions);
      setChoices(data.data.Questions[data.data.Number_question].responses);
      setCorrectAnswer(data.data.Questions[data.data.Number_question].response_correct);
      setQuizID(data.data.ID);
      setSelectedChoice(null);
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
    }
  };

  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(choice);
  };

  const handleVerify = async () => {
    const response = await fetchFromBackend("/api/quiz/verifyAnswer", "POST", JSON.stringify({
      quizID: quizID,
      answer: selectedChoice,
    }));
    const data = await response.json();

    if (response.ok) {
      if (data) {
        setIsAnswerChecked(true);
        setCorrectAnswer(data.data);
        console.log("Vraie reponse correcte", data.data);
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
      setIsAnswerChecked(false);
      setHasUsedCheatsheet(false);
      setCheatsheet([]);
      setCorrectAnswer("");
    } else {
      // navigate("/dashboard");
      setShowResults(true);
    }
  };

  const handleUseCheatsheet = (index: number) => {
    if (!hasUsedCheatsheet && user && updateUser) {  // Vérifie que l'utilisateur existe
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
    try {
      const response = await fetchFromBackend("/api/cheatsheet", "POST", JSON.stringify({
        quizID: quizID,
        rarity: rarity + 3,
      }));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${data.message}`);
      }
      console.log("Indices reçus:", data);
      setCheatsheet(data.data);
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="flex flex-col items-center justify-center bg-[#3A2E5F] p-10 rounded-lg shadow-lg max-w-4xl w-full"
        style={{
          boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
        }}
      >
        {!quizID ? (
          <p
            className="text-lg mb-6 text-center max-w-2xl bg-[#4A3E7F] p-4 rounded-lg text-white"
            style={{ boxShadow: "0 0 10px rgba(228, 112, 163, 0.5)" }}
          >
            Chargement en cours...
          </p>
        ) : showResults ? (
          // Affichage des résultats
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#E470A3]">Résultat</h2>
            <p className="text-lg mb-6 text-white">
              Vous avez {mark} / {questions.length} bonnes réponses !
            </p>
            <button
              className="py-3 px-6 text-lg font-semibold rounded-lg bg-[#E470A3] text-white hover:bg-[#9A60D1] transition duration-300"
              style={{
                boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
              }}
              onClick={() => navigate("/dashboard")}
            >
              Terminer
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-[#E470A3]">
              Question n°{questionNumber + 1}
            </h1>
            <p
              className="text-lg mb-6 text-center max-w-2xl bg-[#4A3E7F] p-4 rounded-lg text-white"
              style={{ boxShadow: "0 0 10px rgba(228, 112, 163, 0.5)" }}
            >
              {questions[questionNumber]?.question_text}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              {choices.map((choice, index) => {
                const isDisabled = cheatsheet.includes(choice);
                return (
                  <button
                    key={index}
                    className={`py-3 px-6 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ${isAnswerChecked
                        ? choice === correctAnswer
                          ? "bg-[#4CAF50] text-white"
                          : "bg-[#F44336] text-white"
                        : isDisabled
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : selectedChoice === choice
                            ? "bg-[#9A60D1] text-white"
                            : "bg-[#E470A3] text-white hover:bg-[#9A60D1]"
                      }`}
                    onClick={() => !isDisabled && handleChoiceClick(choice)}
                    disabled={isDisabled}
                    style={{
                      boxShadow: isAnswerChecked
                        ? choice === correctAnswer
                          ? "0 0 10px rgba(76, 175, 80, 0.6)"
                          : "0 0 10px rgba(244, 67, 54, 0.6)"
                        : isDisabled
                          ? "none"
                          : selectedChoice === choice
                            ? "0 0 10px rgba(154, 96, 209, 0.6)"
                            : "0 0 10px rgba(228, 112, 163, 0.6)",
                    }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-4">
              {/* Bouton Vérifier */}
              <button
                className={`py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-200 ${selectedChoice && !isAnswerChecked
                    ? "bg-[#9A60D1] text-white hover:bg-[#4A2E7A]"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                onClick={handleVerify}
                disabled={!selectedChoice || isAnswerChecked}
                style={{
                  boxShadow:
                    selectedChoice && !isAnswerChecked
                      ? "0px 4px 15px rgba(154, 96, 209, 0.6)" // Purple glow
                      : "none",
                }}
              >
                Vérifier
              </button>

              {/* Bouton Continuer */}
              <button
                type="button"
                className={`py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-200 ${isAnswerChecked
                    ? "bg-[#9A60D1] text-white hover:bg-[#4A2E7A]"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                onClick={handleNextQuestion}
                disabled={!isAnswerChecked}
                style={{
                  boxShadow: isAnswerChecked
                    ? "0px 4px 15px rgba(154, 96, 209, 0.6)" // Purple glow
                    : "none",
                }}
              >
                Continuer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cheatsheet à droite */}
      <ul className="space-y-6 ml-10">
        {user?.Inventory?.map((cheatsheet, index) => (
          <li
            key={index}
            className="flex items-center p-5 bg-[#3A2E5F] rounded-lg shadow-md"
            style={{ boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)" }}
          >
            <div className="mr-4">
              <img
                src={`/images/cheatsheets/rarity${cheatsheet.rarity}.png`}
                alt="Cheatsheet"
                className="w-20 h-20 rounded-lg"
                style={{ background: "transparent" }}
              />
            </div>
            <div>
              <p className="text-white text-lg">
                <strong>x</strong>{cheatsheet.quantity}
              </p>
              <button
                className={`mt-2 py-1 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${hasUsedCheatsheet || cheatsheet.quantity < 1 || isAnswerChecked
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-[#E470A3] text-white hover:bg-[#9A60D1]"
                  }`}
                onClick={() => handleUseCheatsheet(index)}
                disabled={hasUsedCheatsheet || cheatsheet.quantity < 1}
                style={{
                  boxShadow:
                    hasUsedCheatsheet || cheatsheet.quantity < 1
                      ? "none"
                      : "0 0 10px rgba(228, 112, 163, 0.6)",
                }}
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
