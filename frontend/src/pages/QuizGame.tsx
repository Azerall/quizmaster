import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useParams } from "react-router-dom";

const QuizGame = () => {
  const { user, updateUser } = useAuth();
  const { category } = useParams();
  const location = useLocation();
  const { selectedCategory, allCategories } = location.state || {};
  const [method, setMethod] = useState("");
  const [quizType, setQuizType] = useState("");

  const [quizID, setQuizID] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  interface Question {
    question_text: string;
    responses: string[];
  }

  const [questions, setQuestions] = useState<Question[]>([]);
  const [choices, setChoices] = useState<string[]>([]);  // Choix des réponses
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);  // Typé à string ou null
  const [loading, setLoading] = useState(true);  // Le chargement est vrai au début

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
      setQuizID(data.data.ID);
      setSelectedChoice(null);
    } catch (error) {
      console.error("=== Erreur lors de la requête:", error);
    } finally {
      setLoading(false);  
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
        setQuestionNumber(questionNumber + 1);
        setChoices(questions[questionNumber].responses); 
        setSelectedChoice(null);
      }
    } else {
      alert(data.message);
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
        {loading ? (
          <p className="text-lg mb-6 text-center max-w-2xl bg-gray-50 p-4 rounded shadow-md">
            Chargement en cours...
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Question n°{questionNumber + 1}</h1>
            <p className="text-lg mb-6 text-center max-w-2xl bg-gray-50 p-4 rounded shadow-md">
              {questions[questionNumber]?.question_text}  {/* Vérifie si la question existe avant de l'afficher */}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {choices.map((choice, index) => (
                <button
                  key={index}
                  className={`py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200 ${
                    selectedChoice === choice ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
                  }`}
                  onClick={() => handleChoiceClick(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              className={`mt-6 py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200 ${
                selectedChoice ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              onClick={handleVerify}  
              disabled={!selectedChoice}
            >
              Vérifier
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
