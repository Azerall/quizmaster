package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"quizmaster/db"
)

func PullSingleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	var userID struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userID); err != nil {
		http.Error(w, "Erreur lors du décodage de l'id du joueur", http.StatusBadRequest)
		return
	}

	err := db.GetCheatSheet(client, userID.UserID, 1)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération de la cheat sheet", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Pull single réussi")
}

func PullMultiHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	var userID struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userID); err != nil {
		http.Error(w, "Erreur lors du décodage de l'id du joueur", http.StatusBadRequest)
		return
	}

	err := db.GetCheatSheet(client, userID.UserID, 10)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération de la cheat sheet", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Pull multi réussi")
}
