package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"quizmaster/db"
	"quizmaster/model"

	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// création d'un nouvel utilisateur
var jwtKey = []byte("secret_key") // À stocker de manière sécurisée

func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête POST sur /createUser")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusMethodNotAllowed, Message: "Méthode non autorisée"})
		return
	}

	var newUser model.User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusBadRequest, Message: "Données invalides"})
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	// Vérifier si le nom d'utilisateur existe déjà
	exists, err := db.UsernameExists(client, newUser.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la vérification du nom d'utilisateur"})
		return
	}
	if exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusConflict, Message: "Nom d'utilisateur déjà utilisé"})
		return
	}

	// Hachage du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors du hachage du mot de passe"})
		return
	}
	newUser.Password = string(hashedPassword)

	// Initialisation des valeurs par défaut
	newUser.Level = 1
	newUser.Coins = 0
	newUser.Inventory = []model.CheatSheet{}
	newUser.Stats = model.Stats{PlayedQuizzes: 0, WinQuizzes: 0}

	// Insertion en base
	_, err = db.InsertUser(client, newUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de l'insertion de l'utilisateur"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(model.ApiResponse{
		Status:  http.StatusCreated,
		Message: "Utilisateur créé avec succès",
	})
}

// retourne tous les utilisateurs present dans la base de données
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête GET getAllUsers")
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	users, err := db.GetAllUsers(client)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des utilisateurs", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

func GetUserByNameHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	username := vars["username"]
	if username == "" {
		http.Error(w, "Nom d'utilisateur manquant", http.StatusBadRequest)
		return
	}
	client := db.Connect()
	defer client.Disconnect(context.TODO())

	user, err := db.GetUserByName(client, username)
	if err != nil {
		http.Error(w, "Utilisateur non trouvé", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// retourne un utilisateur par son token
func GetUserTokenHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête GET getUsertOken")
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	token := r.Header.Get("Authorization")
	if token == "" {
		http.Error(w, "Token manquant", http.StatusUnauthorized)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())
	log.Println(token)
	user, err := db.GetUserByToken(client, token)
	if err != nil {
		http.Error(w, "Utilisateur pas trouvé", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// LoginHandler gère l'authentification d'un utilisateur
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête POST sur /login")
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var credentials model.User
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(db.LoginResponse{Status: http.StatusBadRequest, Message: "Erreur lors du décodage des identifiants"})
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	log.Printf("Recherche de l'utilisateur avec le nom d'utilisateur: %s et le mot de passe: %s\n", credentials.Username, credentials.Password)
	// Vérifier les identifiants de l'utilisateur et obtenir le token
	loginResponse, err := db.Login(client, credentials.Username, credentials.Password)
	if err != nil {
		log.Printf("Erreur serveur: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(db.LoginResponse{Status: http.StatusInternalServerError, Message: "Erreur serveur"})
		return
	}

	// Utilisation de la réponse structurée pour déterminer le statut HTTP et le message
	w.WriteHeader(loginResponse.Status)
	json.NewEncoder(w).Encode(loginResponse)
}

// LogoutHandler gère la déconnexion d'un utilisateur
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête POST sur /logout")
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	userID := vars["userid"]

	client := db.Connect()
	defer client.Disconnect(context.TODO())
	err := db.DeleteUserToken(client, userID)
	if err != nil {
		http.Error(w, "Erreur lors de la déconnexion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	log.Println("Déconnexion réussie.")
}

// SetPictureHandler gère la mise à jour de l'image de profil d'un utilisateur
func SetPictureHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête POST sur /setPicture")
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	var requestData struct {
		UserID  string `json:"userID"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}
	client := db.Connect()
	defer client.Disconnect(context.TODO())

	err := db.SetUserPicture(client, requestData.UserID, requestData.Picture)
	if err != nil {
		log.Printf("Erreur mise à jour de l'image: %v\n", err)
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	response := model.ApiResponse{
		Status:  http.StatusOK,
		Message: "Image de profil mise à jour avec succès",
	}
	json.NewEncoder(w).Encode(response)
}

// DeleteUserHandler s'occupe de la suppression d'un utilisateur
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête DELETE sur /deleteUser")
	if r.Method != http.MethodDelete {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	userID := vars["userid"]

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	err := db.DeleteUser(client, userID)
	if err != nil {
		http.Error(w, "Erreur lors de la suppression de l'utilisateur", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Compte utilisateur supprimé avec succès"})
}

// UpdateUserPseudoHandler s'occupe de la mise à jour du pseudo d'un utilisateur
func UpdateUserPseudoHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête PUT sur /updatePseudo")
	if r.Method != http.MethodPut {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	userID := vars["userid"]
	var requestData struct {
		NewPseudo string `json:"newPseudo"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	err := db.UpdateUserPseudo(client, userID, requestData.NewPseudo)
	if err != nil {
		http.Error(w, "Erreur lors de la mise à jour du pseudo", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Pseudo mis à jour avec succès"})
}

// UpdateUserPasswordHandler s'occupe de la mise à jour du mot de passe d'un utilisateur
func UpdateUserPasswordHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête PUT sur /updatePassword")
	if r.Method != http.MethodPut {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	userID := vars["userid"]
	var requestData struct {
		NewPassword string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	err := db.UpdateUserPassword(client, userID, requestData.NewPassword)
	if err != nil {
		http.Error(w, "Erreur lors de la mise à jour du mot de passe", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Mot de passe mis à jour avec succès"})
}

func GetUserCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Réception d'une requête GET sur /getUserCategories")

	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Extraire l'username des paramètres de requête
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Nom d'utilisateur manquant", http.StatusBadRequest)
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.TODO())

	// Récupérer les catégories de l'utilisateur
	categories, err := db.GetUserCategories(client, username)
	if err != nil {
		log.Printf("Erreur lors de la récupération des catégories : %v", err)
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(categories)
}

func CreateCategoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusMethodNotAllowed, Message: "Méthode non autorisée"})
		return
	}

	var categoryData struct {
		Username     string           `json:"username"`
		CategoryName string           `json:"categoryName"`
		Questions    []model.Question `json:"questions"`
	}

	if err := json.NewDecoder(r.Body).Decode(&categoryData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusBadRequest, Message: "Données invalides"})
		return
	}
	log.Printf("Données reçues - Catégorie: %s, Utilisateur: %s", categoryData.CategoryName, categoryData.Username)

	if categoryData.Username == "" || categoryData.CategoryName == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusBadRequest, Message: "Le nom de la catégorie et l'utilisateur sont requis"})
		return
	}

	client := db.Connect()
	defer client.Disconnect(context.Background())

	// Vérifier si la catégorie existe déjà pour cet utilisateur
	exists, err := db.CategoryExists(client, categoryData.Username, categoryData.CategoryName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la vérification de la catégorie"})
		return
	}
	if exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusConflict, Message: "La catégorie existe déjà"})
		return
	}

	// Créer la catégorie
	err = db.CreateCategory(client, categoryData.Username, categoryData.CategoryName, categoryData.Questions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusInternalServerError, Message: "Erreur lors de la création de la catégorie"})
		return
	}

	log.Printf("Catégorie créée avec succès: %s pour %s", categoryData.CategoryName, categoryData.Username)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.ApiResponse{Status: http.StatusOK, Message: "Catégorie créée avec succès"})
}
