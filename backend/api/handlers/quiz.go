package handlers

import (
	"context"
	"encoding/json"
	"log"
	"quizmaster/db"

	"net/http"
	"quizmaster/model"
)

func VerifyAnswer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusMethodNotAllowed, Message: "Méthode non autorisée"})
		return
	}

	var requestData struct {
		QuizID string `json:"quizID"`
		Answer string `json:"answer"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusBadRequest, Message: "Données invalides"})
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	quiz, err := db.GetQuizByID(client, requestData.QuizID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la récupération du quiz"})
		return
	}

	if quiz.Questions[quiz.Number_question].ResponseCorrect == requestData.Answer {
		quiz.Note++
	}

	quiz.Number_question++
	if quiz.Number_question == len(quiz.Questions) {
		quiz.Finish = true
		AddStats(quiz.UserID, quiz.ID)
	}

	log.Printf("Mise à jour du quiz avec l'ID : %s\n", quiz.ID)
	_, err = db.UpdateQuiz(client, quiz)
	if err != nil {
		log.Printf("Erreur lors de la mise à jour du quiz : %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la mise à jour du quiz"})
		return
	}

	responseMessage := "Réponse vérifiée avec succès"
	if quiz.Finish {
		responseMessage += " et le quiz est terminé"
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: responseMessage})
}

func AddStats(playerID string, quizID string) {
	client := db.Connect()
	defer client.Disconnect(context.Background())

	// quiz, err := db.GetQuizByID(client, quizID)
	_, err := db.GetQuizByID(client, quizID) // On ne fait rien avec le quiz pour l'instant vu qu'on sait pas quel stats augmenter
	if err != nil {
		log.Printf("Erreur lors de la récupération du quiz : %v\n", err)
		return
	}

	user, err := db.GetUserByID(client, playerID)
	if err != nil {
		log.Printf("Erreur lors de la récupération de l'utilisateur : %v\n", err)
		return
	}

	user.Stats.PlayedQuizzes += 1
	// Faudra aussi modifier d'autres stats pour le joueur mais a voir plus tard
	// LEVEL, COINS, INVENTORY, STATS

	_, err = db.UpdateUser(client, user)
	if err != nil {
		log.Printf("Erreur lors de la mise à jour de l'utilisateur : %v\n", err)
		return
	}

}

func CreateQuestionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusMethodNotAllowed, Message: "Méthode non autorisée"})
		return
	}

	var QuestionData struct {
		CategoryName string         `json:"category_name"`
		Question     model.Question `json:"question"`
	}

	if err := json.NewDecoder(r.Body).Decode(&QuestionData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusBadRequest, Message: "Données invalides"})
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	// Log des données reçues
	log.Printf("Données reçues - Catégorie: %s, Question: %s", QuestionData.CategoryName, QuestionData.Question.QuestionText)

	// Vérification de l'existence de la question
	existQuestion, question, err := db.ExistQuestion(client, "67b9d9d77163bb4b523cbf71", QuestionData.CategoryName, QuestionData.Question)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la vérification de l'existence de la question"})
		return
	}

	if existQuestion {
		// La question existe déjà
		log.Printf("La question existe déjà: %v", question)
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusConflict, Message: "La question existe déjà", Data: question})
		return
	}

	// Création de la question
	err = db.CreateQuestion(client, "67b9d9d77163bb4b523cbf71", QuestionData.CategoryName, QuestionData.Question)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la création de la question"})
		return
	}

	// Question créée avec succès
	log.Printf("Question créée avec succès: %v", QuestionData.Question)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Question créée avec succès"})
}
