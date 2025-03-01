import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const QuizGame = () => {
  const { user, updateUser } = useAuth();

  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState("Quel est le langage de programmation utilisé pour développer React ?");
  const [choices, setChoices] = useState([
    "Python",
    "JavaScript",
    "C++",
    "Java"
  ]);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const handleQuiz = async (e: { preventDefault: () => void } ) => {
    if (e) e.preventDefault();
    const API_URL = "http://localhost:8080";
    const endpoint = `${API_URL}/api/quiz/question`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (response.ok) {
      setQuestionNumber(data.questionNumber);
      setQuestion(data.question);
      setChoices(data.choices);
      setSelectedChoice(null);
    } else {
      console.error(data.message);
    }
  }


  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);
  };

  const handleConfirm = () => {
    alert(`Vous avez sélectionné : ${selectedChoice}`);
    // Ici, tu peux ajouter la logique pour passer à la question suivante
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center bg-white p-10 border border-gray-300 max-w-4xl w-full rounded-lg shadow-lg">
        {/* Numéro de la question */}
        <h1 className="text-2xl font-bold mb-4">Question n°{questionNumber}</h1>

        {/* Question */}
        <p className="text-lg mb-6 text-center max-w-2xl bg-gray-50 p-4 rounded shadow-md">
          {question}
        </p>

        {/* Choix de réponse */}
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

        {/* Bouton "Confirmer" */}
        <button
          className={`mt-6 py-3 px-6 text-lg font-semibold rounded shadow-md transition-all duration-200 ${
            selectedChoice ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={handleConfirm}
          disabled={!selectedChoice} // Désactivé si aucun choix n'est sélectionné
        >
          Confirmer
        </button>
      </div>
    </div>
  );
};

export default QuizGame;
