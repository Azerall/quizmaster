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
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hasUsedCheatsheet, setHasUsedCheatsheet] = useState<boolean>(false);
  const [cheatsheet, setCheatsheet] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [mark, setMark] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<{ sender: string; text: string }[]>([]);

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

    let body = null;
    if (method === "POST") {
      body = JSON.stringify({
        username: user?.Username,
        categoryname: selectedCategory,
      });
    }

    try {
      const response = await fetchFromBackend(endpoint, method, body);
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

      if (data.message === "Quiz récupéré avec succès") {
        alert("Vous aviez déjà commencé un quiz. Vous reprennez à la question n°" + (data.data.Number_question+1));
      }
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
      setShowChat(false);
      setChat([]);
    } else {
      setShowResults(true);
      const updatedMark = mark + (selectedChoice === correctAnswer ? 1 : 0);
      if (user && updateUser) {
        updateUser({ ...user, 
          Stats: { 
            ...user.Stats, 
            quizzes_played: user.Stats.quizzes_played + 1, 
            correct_responses: user.Stats.correct_responses + updatedMark,
            full_marks: updatedMark === questions.length ? user.Stats.full_marks + 1 : user.Stats.full_marks,
          } 
        });
      }
    }
  };

  const handleUseCheatsheet = (index: number) => {
    if (!hasUsedCheatsheet && user && updateUser) {  // Vérifie que l'utilisateur existe
      const updatedInventory = [...user!.Inventory];
      if (updatedInventory[index].quantity > 0) {
        updatedInventory[index].quantity -= 1;

        updateUser({ ...user, Inventory: updatedInventory, Stats: { ...user.Stats, used_cheat_sheets: user.Stats.used_cheat_sheets + 1 } });
        setHasUsedCheatsheet(true);

        handleCheatSheet(index);
        if (index + 3 == 6) {
          setShowChat(true);
        }
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
      if (data.data) setCheatsheet(data.data);
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
    }
  };

  const handleChatBotAI = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prevChat) => [...prevChat, userMessage]);

    try {
      const response = await fetchFromBackend("/api/chat", "POST", JSON.stringify({ message: message }));

      const data = await response.json();
      console.log("Réponse de l'API Chat AI:", data);
      if (data.status === 200) {
        const botMessage = { sender: "bot", text: data.data };
        setChat((prevChat) => [...prevChat, botMessage]);
      } else if (data.status === 500) {
        const botMessage = { sender: "bot", text: "Désolé, la limite de requêtes a été atteinte. Veuillez réessayer plus tard." };
        setChat((prevChat) => [...prevChat, botMessage]);
      }
      else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la requête du Chat AI:", error);
    }
    setMessage("");
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

      {showChat && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-2xl shadow-xl w-80 transition-all ${isMinimized ? "h-16" : "h-[36rem]"
            }`}
          style={{
            backgroundColor: "#292047", // Deep purple background
            boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
            border: "none", // Remove gray border
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-[#E470A3] font-roboto">Chat AI</h2>
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-[#E470A3] hover:text-[#D65F8F]">
              {isMinimized ? "▲" : "▼"}
            </button>
          </div>
          {!isMinimized && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-2 rounded-lg mb-3 bg-[#3A2E5F] flex flex-col"> {/* Darker purple for chat area */}
                <div className="text-white mb-2 font-roboto">Bienvenue dans le chat AI !</div>
                {chat.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-lg font-roboto inline-block max-w-[80%] 
                      ${message.sender === "user"
                        ? "bg-[#E470A3] text-white text-right self-end" // Pink for user messages
                        : "bg-[#4A3E7F] text-white text-left self-start" // Dark purple for AI messages
                      }`}
                  >
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-auto mb-8 mr-2">
                <input
                  type="text"
                  className="flex-1 p-2 border border-[#E470A3] rounded-lg focus:outline-none bg-[#4A3E7F] text-white placeholder-gray-300 font-roboto"
                  placeholder="Tapez votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatBotAI()}
                />
                <button
                  className="px-2 py-2 bg-[#E470A3] text-white rounded-lg hover:bg-[#D65F8F] transition font-roboto"
                  style={{
                    boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6)",
                  }}
                  onClick={handleChatBotAI}
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default QuizGame;
