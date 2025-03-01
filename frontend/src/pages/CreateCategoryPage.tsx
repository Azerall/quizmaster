import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateCategoryPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
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
      const categoryResponse = await fetch("http://localhost:8080/api/user/createCategory", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: token || "",
          },
          body: JSON.stringify({
              username: user.Username,
              categoryname: categoryName,
              questions: validQuestions
          }),
      });

      if (!categoryResponse.ok) throw new Error("Erreur lors de la création de la catégorie.");

      alert("Catégorie créée avec succès !");
      navigate("/quizzes");
  } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite.");
  }
};

return (
  <div className="h-screen flex flex-col items-center bg-transparent pt-10">
    <div className="w-full max-w-2xl bg-[#292047] shadow-lg rounded-lg p-6 relative border border-[#9A60D1]">
      <h1 className="text-[#E470A3] text-4xl font-bold text-center mb-6">Créer une Catégorie</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-white text-lg">Nom de la Catégorie :</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-2 bg-transparent border-b-2 border-[#E470A3] text-white outline-none text-center"
        />

        <h2 className="text-white text-lg mt-4">Ajouter des Questions :</h2>

        <div className="max-h-[500px] overflow-y-auto space-y-4 p-2 border border-[#9A60D1] rounded-md">
          {questions.map((q, index) => (
            <div key={index} className="mb-2 p-2 bg-[#403060] rounded-md">
              <input
                type="text"
                placeholder="Question"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                className="w-full p-2 bg-[#292047] rounded-md text-white border border-[#9A60D1]"
              />
              <input
                type="text"
                placeholder="Réponse correcte"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                className="w-full p-2 bg-[#292047] rounded-md text-white border border-[#E470A3] mt-2"
              />
              {q.wrongAnswers.map((wrong, wIndex) => (
            <input
                key={wIndex}
                type="text"
                placeholder={`Mauvaise réponse ${wIndex + 1}`}
                value={wrong}
                onChange={(e) => handleQuestionChange(index, "wrongAnswers", e.target.value)}
                className="w-full p-2 bg-[#292047] rounded-md text-white border border-[#9A60D1] mt-2"
                />
              ))}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="mt-2 bg-[#4A2E7A] text-white px-4 py-2 rounded-lg hover:bg-[#9A60D1] transition"
        >
          ➕ Ajouter une Question
        </button>

        <button
          type="submit"
          className="mt-4 bg-[#E470A3] text-white px-6 py-3 rounded-lg w-full hover:bg-[#D65F8F] transition"
        >
          Créer la Catégorie
        </button>
      </form>
    </div>
  </div>
);
};

export default CreateCategoryPage;