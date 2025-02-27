package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"quizmaster/db"

	"net/http"
	"quizmaster/model"
)

var categoryMap = map[string]string{
	"General Knowledge":      "9",
	"Books":                  "10",
	"Film":                   "11",
	"Music":                  "12",
	"Musicals & Theatres":    "13",
	"Television":             "14",
	"Video Games":            "15",
	"Board Games":            "16",
	"Science & Nature":       "17",
	"Computers":              "18",
	"Mathematics":            "19",
	"Mythology":              "20",
	"Sports":                 "21",
	"History":                "23",
	"Politics":               "24",
	"Art":                    "25",
	"Celebrities":            "26",
	"Animals":                "27",
	"Vehicles":               "28",
	"Comics":                 "29",
	"Gadgets":                "30",
	"Japanese Anime & Manga": "31",
	"Cartoon & Animations":   "32",
}

// Fonction pour convertir un tableau d'interface{} en tableau de string
func toStringSlice(input interface{}) ([]string, error) {
	items, ok := input.([]interface{})
	if !ok {
		return nil, fmt.Errorf("conversion en []string échouée")
	}

	var result []string
	for _, item := range items {
		str, ok := item.(string)
		if !ok {
			return nil, fmt.Errorf("élément non convertible en string")
		}
		result = append(result, str)
	}

	return result, nil
}

// récuperation d'un quizz par un API externe
func GenerateQuiz(userName string, category string) model.Quiz {
	log.Println("Réception d'une requête GET sur /getQuizByExternalAPI")
	url := "https://opentdb.com/api.php?amount=10&category=" + categoryMap[category] + "&difficulty=easy&type=multiple"
	resp, err := http.Get(url)
	if err != nil {
		log.Println("Erreur lors de la récupération du quizz")
	}
	defer resp.Body.Close()

	var quiz model.Quiz

	jsonData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Erreur lors de la lecture du body")
	}

	var jsonDataMap map[string]interface{}
	err = json.Unmarshal(jsonData, &jsonDataMap)
	if err != nil {
		log.Println("Erreur lors de l'unmarshalling du JSON")
	}

	result, ok := jsonDataMap["results"].([]interface{})
	if !ok {
		log.Println("Erreur lors de la récupération des questions")
	}

	for _, question := range result {
		questionMap, ok := question.(map[string]interface{})
		if !ok {
			log.Println("Erreur lors de la récupération de la question")
			continue
		}

		// Conversion des réponses incorrectes
		incorrectAnswers, err := toStringSlice(questionMap["incorrect_answers"])
		if err != nil {
			log.Println("Erreur lors de la conversion des réponses incorrectes:", err)
			continue
		}

		// Récupération de la réponse correcte
		correctAnswer, ok := questionMap["correct_answer"].(string)
		if !ok {
			log.Println("Erreur lors de la récupération de la réponse correcte")
			continue
		}

		quiz.Questions = append(quiz.Questions, model.Question{
			QuestionText:    questionMap["question"].(string),
			Responses:       append(incorrectAnswers, correctAnswer),
			ResponseCorrect: correctAnswer,
		})
	}

	quiz.Username = userName
	quiz.Mark = 0
	quiz.Finish = false
	quiz.Number_question = 0

	return quiz
}

func GenerateQuizHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête GET sur /getQuizByExternalAPI")
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Username string `json:"username"`
		Category string `json:"category"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	// boolexist, onGoingQuiz := db.OnGoindQuiz(client, "67b9d9d77163bb4b523cbf71")
	boolexist, onGoingQuiz := db.OnGoindQuiz(client, request.Username)
	if boolexist {
		w.WriteHeader(http.StatusOK)
		log.Println("Quiz récupéré avec succès")
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Quiz récupéré avec succès", Data: onGoingQuiz})
		return
	}

	quiz := GenerateQuiz(request.Username, request.Category)

	err := db.CreateQuiz(client, quiz)
	if err != nil {
		http.Error(w, "Erreur lors de l'insertion du quiz", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Quiz généré avec succès", Data: quiz})
}
