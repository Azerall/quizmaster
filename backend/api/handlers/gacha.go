package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"quizmaster/db"
	"quizmaster/model"
)

func PullHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	var requestData struct {
		Username string `json:"username"`
		Quantity int    `json:"quantity"`
	}

	var message string
	if requestData.Quantity == 1 {
		message = "Pull single réussi"
	} else {
		message = "Pull multi réussi"
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Erreur lors du décodage de l'id du joueur", http.StatusBadRequest)
		return
	}

	result, err := db.GetCheatSheet(client, requestData.Username, requestData.Quantity)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: err.Error(), Data: nil})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: message, Data: result})
}

func UseCheatSheetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	var requestData struct {
		QuizID string `json:"quizID"`
		Rarity int    `json:"rarity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Erreur lors du décodage de l'id du joueur", http.StatusBadRequest)
		return
	}

	result, err := db.UseCheatSheet(client, requestData.QuizID, requestData.Rarity)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: err.Error(), Data: nil})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "CheatSheet utilisé avec succès", Data: result})
}
