package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"quizmaster/model"
)

type ChatRequest struct {
	Message string `json:"message"`
}

// Structure de la requête vers AIMLAPI
type AIMLAPIRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AIMLAPIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	if r.Method != http.MethodPost {
		json.NewEncoder(w).Encode(model.ApiResponse{
			Status:  http.StatusMethodNotAllowed,
			Message: "Méthode non autorisée",
		})
		return
	}

	// Décoder la requête
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(model.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "Corps de la requête invalide",
		})
		return
	}

	if req.Message == "" {
		json.NewEncoder(w).Encode(model.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "Le message ne peut pas être vide",
		})
		return
	}

	// Récupérer les clés API depuis .env
	apiKeys := strings.Split(os.Getenv("AIMLAPI_KEYS"), ",")
	if len(apiKeys) == 0 {
		json.NewEncoder(w).Encode(model.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "Aucune clé API configurée",
		})
		return
	}

	// Configurer le client HTTP avec timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Préparer la requête AIMLAPI
	aimlReq := AIMLAPIRequest{
		Model: "gpt-3.5-turbo",
		Messages: []Message{
			{Role: "system", Content: "Tu es un chatbot utile."},
			{Role: "user", Content: req.Message},
		},
	}

	var response AIMLAPIResponse
	var lastErr error

	// Essayer chaque clé API jusqu'à succès ou épuisement
	for _, apiKey := range apiKeys {
		aimlReqBody, _ := json.Marshal(aimlReq)

		httpReq, err := http.NewRequest("POST", "https://api.aimlapi.com/v1/chat/completions", strings.NewReader(string(aimlReqBody)))
		if err != nil {
			lastErr = err
			log.Printf("Erreur lors de la création de la requête AIMLAPI: %v", err)
			continue
		}

		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("Authorization", "Bearer "+apiKey)

		resp, err := client.Do(httpReq)
		if err != nil {
			lastErr = err
			log.Printf("Erreur lors de la requête vers AIMLAPI: %v", err)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
			body, _ := io.ReadAll(resp.Body)
			lastErr = fmt.Errorf("code de statut inattendu: %d, corps: %s", resp.StatusCode, string(body))
			log.Printf("Erreur - %v", lastErr)
			continue
		}

		if err = json.NewDecoder(resp.Body).Decode(&response); err != nil {
			lastErr = err
			log.Printf("Erreur lors du décodage de la réponse AIMLAPI: %v", err)
			continue
		}

		// Succès, on sort de la boucle
		break
	}

	if len(response.Choices) == 0 {
		json.NewEncoder(w).Encode(model.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "Échec de la réponse AI après avoir essayé toutes les clés",
			Data:    lastErr,
		})
		return
	}

	// Envoyer la réponse
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{
		Status:  http.StatusOK,
		Message: "Réponse générée avec succès",
		Data:    response.Choices[0].Message.Content,
	})
}
