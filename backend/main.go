package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"quizmaster/api"
	"quizmaster/db"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur lors du chargement du fichier .env")
	}

	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("MONGO_URI est vide ou non défini")
	}

	api.ConfigureRoutes()
	log.Println("Server starting on port 8080...")
	router := api.ConfigureRoutes()

	client := db.Connect()

	defer client.Disconnect(context.TODO())

	// Pour éviter les problèmes de CORS
	corsOpts := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"}),
		handlers.AllowCredentials(),
	)
	if err := http.ListenAndServe("0.0.0.0:8080", corsOpts(router)); err != nil {
		log.Fatalf("Error starting server: %s\n", err)
	}
}
