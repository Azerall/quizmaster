import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { user, fetchFromBackend } = useAuth();

  const [categoryName, setCategoryName] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", correctAnswer: "", wrongAnswers: ["", "", ""] }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", correctAnswer: "", wrongAnswers: ["", "", ""] }
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: string, wrongIndex?: number) => {
    const newQuestions = [...questions];

    if (field === "wrongAnswers" && wrongIndex !== undefined) {
      newQuestions[index].wrongAnswers[wrongIndex] = value;
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }

    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName) return alert("Le nom de la catégorie est requis.");
    if (!user?.Username) return alert("Utilisateur non identifié.");

    // Filtrer les questions vides et structurer les données
    const validQuestions = questions
      .filter(q => q.question.trim() !== "" && q.correctAnswer.trim() !== "")
      .map(q => ({
        question_text: q.question,
        response_correct: q.correctAnswer,
        responses: [...q.wrongAnswers.filter(r => r.trim() !== ""), q.correctAnswer]
      }));

    try {
      const categoryResponse = await fetchFromBackend("/api/user/createCategory", "POST",
        JSON.stringify({
          username: user.Username,
          categoryname: categoryName,
          questions: validQuestions
        })
      );

      if (!categoryResponse.ok) throw new Error("Erreur lors de la création de la catégorie.");

      alert("Catégorie créée avec succès !");
      navigate("/quizzes");
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite.");
    }
  };

  return (
    <div className="h-screen pt-[100px] flex flex-col items-center bg-transparent">
      <div className="relative w-full max-w-4xl">
        <h1 className="text-[#E470A3] text-4xl font-bold text-center mb-6">Créer une catégorie</h1>
        <div className="rounded-lg"
          style={{
            boxShadow: "0px 4px 15px rgba(64, 196, 255, 0.6), 0px 0px 25px rgba(64, 196, 255, 0.4)",
          }}
        >
          <form onSubmit={handleSubmit} className="w-full bg-[#292047] shadow-lg rounded-lg p-6 flex flex-col gap-4 h-auto overflow-y-auto">
            <label className="text-white text-lg text-center block -mb-4">Nom de la Catégorie :</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-1/3 mx-auto p-2 bg-[#292047] border-b-2 border-[#E470A3] text-[#E470A3] outline-none text-center rounded-none"
            />

            <h2 className="text-white text-lg text-center mt-4 block">Ajouter des questions :</h2>

            <div className="max-h-[calc(100vh-500px)] flex flex-col items-center space-y-2 p-5 border border-[#9A60D1] rounded-md bg-[#1E1A33] overflow-y-auto">
              {questions.map((q, index) => (
                <div key={index} className="w-full mb-2 p-5 pt-1 mb-5 bg-[#292047] rounded-md relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(index)}
                    className="absolute top-0 right-2 text-gray-500 hover:text-gray-300 transition"
                    style={{ fontSize: "1.5rem" }}
                  >
                    ✕
                  </button>
                  <div className="w-full flex justify-center mb-5">
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                      className="w-2/3 p-2 bg-[#292047] border-b-2 border-[#40C4FF] text-[#40C4FF] text-center outline-none rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Réponse correcte"
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                      className="w-full p-2 bg-[#292047] rounded-md text-white border border-[#E470A3] outline-none focus:border-[#40C4FF] focus:ring-2 focus:ring-[#40C4FF]/50"
                    />
                    {q.wrongAnswers.map((wrong, wIndex) => (
                      <input
                        key={wIndex}
                        type="text"
                        placeholder={`Mauvaise réponse ${wIndex + 1}`}
                        value={wrong}
                        onChange={(e) => handleQuestionChange(index, "wrongAnswers", e.target.value, wIndex)}
                        className="w-full p-2 bg-[#292047] rounded-md text-white border border-[#9A60D1] outline-none focus:border-[#40C4FF] focus:ring-2 focus:ring-[#40C4FF]/50"
                      />
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-[#9A60D1] text-white px-4 py-2 rounded-lg hover:bg-[#4A2E7A] transition w-1/4"
              >
                ➕ Ajouter une Question
              </button>
            </div>

            <div className="flex justify-center gap-4 mt-2">
              <button
                type="submit"
                className="bg-[#E470A3] text-white px-6 py-3 rounded-lg hover:bg-[#D65F8F] transition"
                style={{
                  background: "linear-gradient(90deg, #E470A3, #9A60D1)",
                  boxShadow: "0px 4px 15px rgba(228, 112, 163, 0.6), 0px 0px 25px rgba(228, 112, 163, 0.4)",
                }}
              >
                Créer la Catégorie
              </button>
              <button
                type="button"
                onClick={() => navigate("/quizzes")}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
                style={{
                  boxShadow: "0px 4px 15px rgba(128, 128, 128, 0.6), 0px 0px 25px rgba(128, 128, 128, 0.4)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default CreateCategoryPage;