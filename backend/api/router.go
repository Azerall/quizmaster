package api

import (
	"log"
	"net/http"
	"os"
	"quizmaster/api/handlers"

	"github.com/gorilla/mux"
)

func request(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Requete - Methode : %s, Chemin : %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

// gestion des routes
func ConfigureRoutes() *mux.Router {
	r := mux.NewRouter() // r est l'objet Router de mux qui gère le routage des requêtes HTTP
	r.Use(request)       // appeler request pour chaque requête

	// Handlers pour les endpoints de l'API utilisateur
	r.HandleFunc("/api/user/createUser", handlers.CreateUserHandler).Methods("POST")
	r.HandleFunc("/api/user/getall/", handlers.GetAllUsersHandler).Methods("GET")
	r.HandleFunc("/api/user/getUserToken", handlers.GetUserTokenHandler).Methods("GET")
	r.HandleFunc("/api/user/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/api/user/logout/{userid}", handlers.LogoutHandler).Methods("POST")
	r.HandleFunc("/api/user/changeUsername/{userid}", handlers.UpdateUserUsernameHandler).Methods("PUT")
	r.HandleFunc("/api/user/changePassword/{userid}", handlers.UpdateUserPasswordHandler).Methods("PUT")
	r.HandleFunc("/api/user/changePicture/{userid}", handlers.UpdateUserPictureHandler).Methods("PUT")
	r.HandleFunc("/api/user/deleteUser/{userid}", handlers.DeleteUserHandler).Methods("DELETE")
	r.HandleFunc("/api/user/getUserCategories", handlers.GetUserCategoriesHandler).Methods("GET")
	r.HandleFunc("/api/user/createCategory", handlers.CreateCategoryHandler).Methods("POST")
	r.HandleFunc("/api/user/updateCategory", handlers.UpdateCategoryHandler).Methods("PUT")
	r.HandleFunc("/api/user/getUser/{username}", handlers.GetUserByNameHandler).Methods("GET")
	r.HandleFunc("/api/user/getTopPlayers", handlers.GetTopPlayers).Methods("GET")

	// Handlers pour les endpoints de l'API quiz
	r.HandleFunc("/api/quiz/getQuizByExternalAPI/{category}", handlers.GenerateQuizHandler).Methods("GET")
	r.HandleFunc("/api/quiz/verifyAnswer", handlers.VerifyAnswer).Methods("POST")
	r.HandleFunc("/api/quiz/createQuestion", handlers.CreateQuestionHandler).Methods("POST")
	r.HandleFunc("/api/quiz/createQuiz/{category}", handlers.CreateQuizHandler).Methods("POST")

	// Handlers pour les endpoints de l'API AIMLAPI
	r.HandleFunc("/api/chat", handlers.ChatHandler).Methods("POST")

	// Handlers pour les endpoints de l'API gacha
	r.HandleFunc("/api/gacha/pull", handlers.PullHandler).Methods("POST")

	// Handlers pour cheatSheet
	r.HandleFunc("/api/cheatsheet", handlers.UseCheatSheetHandler).Methods("POST")

	buildDir := "../client/build"
	fileServer := http.FileServer(http.Dir(buildDir))

	// Le chemin "/" correspond à toutes les requêtes non reconnu par l'API ou à un fichier statique existant
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := buildDir + r.URL.Path
		if _, err := os.Stat(path); os.IsNotExist(err) {
			// le fichier n'existe pas, on sert index.html
			http.ServeFile(w, r, buildDir+"/index.html")
		} else {
			// le fichier existe, cela signifie qu'il s'agit d'un fichier statique
			fileServer.ServeHTTP(w, r)
		}
	}))

	return r
}
