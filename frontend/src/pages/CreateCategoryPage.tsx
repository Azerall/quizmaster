import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const CreateCategoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, fetchFromBackend } = useAuth();
  const { selectedCategory } = location.state || {};

  const [categoryName, setCategoryName] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", correctAnswer: "", wrongAnswers: ["", "", ""] }
  ]);

  useEffect(() => {
    if (selectedCategory) {
      console.log("Catégorie en cours de modification :", selectedCategory);

      const transformedQuestions = selectedCategory.Questions.map((q: { question_text: string; response_correct: string; responses: string[] }) => {
        const correctAnswer = q.response_correct;
        /// Exclure uniquement la première occurrence de la réponse correcte
        const firstCorrectIndex = q.responses.indexOf(correctAnswer);
        const wrongAnswers = q.responses.filter((_, index) => index !== firstCorrectIndex);
        return {
          question: q.question_text,
          correctAnswer: correctAnswer,
          wrongAnswers: wrongAnswers.length === 3 ? wrongAnswers : [...wrongAnswers]
        };
      });

      setCategoryName(selectedCategory.CategoryName);
      setQuestions(transformedQuestions);
    }
  }, [selectedCategory]);

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
    if (questions.length < 10) return alert("Veuillez ajoutez au minimum 10 questions.");

    // Filtrer les questions vides et structurer les données
    const validQuestions = questions
      .filter(q =>
        q.question.trim() !== "" &&
        q.correctAnswer.trim() !== "" &&
        q.wrongAnswers.every(w => w.trim() !== "") // Vérifie que toutes les wrongAnswers sont non vides
      )
      .map(q => ({
        question_text: q.question,
        response_correct: q.correctAnswer,
        responses: [...q.wrongAnswers, q.correctAnswer] // Combine wrongAnswers et correctAnswer
      }));

    if (validQuestions.length < 10) {
      return alert("Veuillez remplir toutes les questions, réponses correctes et mauvaises réponses.");
    }

    try {
      if (selectedCategory) {
        const categoryResponse = await fetchFromBackend(
          "/api/user/updateCategory",
          "PUT", // ou "POST" selon votre choix final
          JSON.stringify({
            username: user.Username,
            categoryname: selectedCategory.CategoryName,
            newCategoryName: categoryName,
            questions: validQuestions
          })
        );

        if (!categoryResponse.ok) {
          if (categoryResponse.status === 409) { // StatusConflict
            throw new Error("Le nouveau nom de catégorie existe déjà.");
          }
          throw new Error("Erreur lors de la modification de la catégorie.");
        }

        alert("Catégorie modifiée avec succès !");
      } else {
        const categoryResponse = await fetchFromBackend("/api/user/createCategory", "POST",
          JSON.stringify({
            username: user.Username,
            categoryname: categoryName,
            questions: validQuestions
          })
        );

        if (!categoryResponse.ok) {
          if (categoryResponse.status === 409) { // StatusConflict
            throw new Error("Une catégorie avec ce nom existe déjà, choissisez un autre nom.");
          }
          throw new Error("Erreur lors de la création de la catégorie.");
        }

        alert("Catégorie créée avec succès !");
      }
      navigate("/quizmaster/quizzes");
    } catch (error) {
      console.error(error);
      //alert("Une erreur s'est produite.");
      alert(error);
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
                    <label className="p-2 text-[#40C4FF] text-lg">{index + 1}. </label>
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                      className="w-2/3 p-2  border-b-2 border-[#40C4FF] text-[#40C4FF] text-center outline-none rounded-none"
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
                { selectedCategory ? "Modifier" : "Créer" } la Catégorie
              </button>
              <button
                type="button"
                onClick={() => navigate("/quizmaster/quizzes")}
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