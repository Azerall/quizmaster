package db

import (
	"context"
	"errors"
	"log"
	"math/rand"
	"os"
	"quizmaster/model"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

// structure de réponse pour la connexion
type LoginResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	UserID  string `json:"userID"`
	Token   string `json:"token,omitempty"`
}

// ================== Fonctions pour les connexions ==================

// se connecte à la base de données MongoDB
func Connect() *mongo.Client {
	log.Println("Connexion à la base de données")
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Println("Erreur lors du connexion à la base de données")
		log.Fatal(err)
	}
	return client
}

// se connecte à la base de données et vérifie les identifiants de l'utilisateur
func Login(client *mongo.Client, username, password string) (LoginResponse, error) {
	coll := client.Database("DB").Collection("users")

	// 1. Récupérer l'utilisateur par son username uniquement
	var user model.User
	err := coll.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return LoginResponse{Status: 401, Message: "Identifiants invalides"}, nil
		}
		return LoginResponse{}, err
	}

	// 2. Comparer le mot de passe fourni avec celui haché en base
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return LoginResponse{Status: 401, Message: "Identifiants invalides"}, nil
	}

	log.Printf("Authentification réussie pour l'utilisateur %s\n", user.Username)

	// 3. Génération d'un token (JWT recommandé)
	token := time.Now().Format(time.RFC3339) + user.Username
	objID, err := primitive.ObjectIDFromHex(user.ID)
	_, err = coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"token": token}},
	)
	if err != nil {
		return LoginResponse{}, err
	}

	return LoginResponse{Status: 200, Message: "Authentification réussie", UserID: user.ID, Token: token}, nil
}

// deconnecte l'utilisateur en supprimant le token de la base de données
func DeleteUserToken(client *mongo.Client, userID string) error {
	coll := client.Database("DB").Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	_, err = coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"token": ""}},
	)
	return err
}

// ================== Fonctions pour User ==================

// InsertUser insère un utilisateur dans la base de données
func InsertUser(client *mongo.Client, user model.User) (*mongo.InsertOneResult, error) {
	log.Println("insertion de l'user dans la bdd")
	coll := client.Database("DB").Collection("users")
	return coll.InsertOne(context.TODO(), user)
}

// UsernameExists vérifie si un nom d'utilisateur existe déjà dans la base de données
func UsernameExists(client *mongo.Client, username string) (bool, error) {
	log.Println("Recherche de l'utilisateur avec le nom d'utilisateur: ", username)
	coll := client.Database("DB").Collection("users")
	count, err := coll.CountDocuments(context.TODO(), bson.M{"username": username})
	if err != nil {
		log.Printf("Erreur lors de la recherche de l'utilisateur avec le nom d'utilisateur: %v\n", err)
		return false, err
	}
	return count > 0, nil
}

// GetAllUsers récupère tous les utilisateurs de la base de données
func GetAllUsers(client *mongo.Client) ([]model.User, error) {
	coll := client.Database("DB").Collection("users")
	ctx := context.TODO()

	cursor, err := coll.Find(ctx, bson.D{{}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []model.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

// GetUserByID recherche un utilisateur par son ID dans la base de données
func GetUserByID(client *mongo.Client, userID string) (model.User, error) {
	var user model.User
	collection := client.Database("DB").Collection("users")

	objID, err := primitive.ObjectIDFromHex(userID) // je convertis l'ID en ObjectID (type de MongoDB)
	if err != nil {
		return user, err // si l'ID n'est pas valide,  retourne une erreur
	}

	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	return user, err
}

func GetUserByName(client *mongo.Client, username string) (model.User, error) {
	var user model.User
	collection := client.Database("DB").Collection("users")

	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return user, err
	}
	return user, nil
}

// GetUserByToken recherche un utilisateur par son token dans la base de données
func GetUserByToken(client *mongo.Client, token string) (model.User, error) {
	var user model.User
	collection := client.Database("DB").Collection("users")
	log.Println("Recherche de l'utilisateur avec le token: ", token)
	err := collection.FindOne(context.TODO(), bson.M{"token": token}).Decode(&user)
	if err != nil {
		return user, err
	}
	return user, nil
}

// UpdateUserScores met à jour les scores de l'utilisateur
func UpdateUserScores(client *mongo.Client, userId string, correctAnswersIncrement, experienceIncrement int, nbAnswersIncrement int) error {
	coll := client.Database("DB").Collection("users")
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return err
	}
	_, err = coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": id},
		bson.M{
			"$inc": bson.M{
				"correctAnswers": correctAnswersIncrement,
				"experience":     experienceIncrement,
				"nbAnswers":      nbAnswersIncrement,
			},
		},
	)
	return err
}

// SetUserPicture met à jour l'image de profil de l'utilisateur
func SetUserPicture(client *mongo.Client, userId string, picture string) error {
	coll := client.Database("DB").Collection("users")
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return err
	}
	_, err = coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"picture": picture}},
	)
	return err
}

// DeleteUser supprime un utilisateur de la base de données
func DeleteUser(client *mongo.Client, userID string) error {
	coll := client.Database("DB").Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Erreur lors de la conversion de l'ID utilisateur en ObjectID : %v\n", err)
		return err
	}

	result, err := coll.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		log.Printf("Erreur lors de la suppression de l'utilisateur : %v\n", err)
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("aucun utilisateur supprimé")
	}

	log.Printf("Utilisateur supprimé avec succès : %v\n", result.DeletedCount)
	return nil
}

// UpdateUserPseudo met à jour le pseudo de l'utilisateur
func UpdateUserPseudo(client *mongo.Client, userID string, newPseudo string) error {
	coll := client.Database("DB").Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Erreur lors de la conversion de l'ID utilisateur en ObjectID : %v\n", err)
		return err
	}

	result, err := coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"pseudo": newPseudo}},
	)
	if err != nil {
		log.Printf("Erreur lors de la mise à jour du pseudo de l'utilisateur : %v\n", err)
		return err
	}

	if result.ModifiedCount == 0 {
		return errors.New("Aucune mise à jour effectuée")
	}

	log.Printf("Pseudo de l'utilisateur mis à jour avec succès. Documents affectés: %v\n", result.ModifiedCount)
	return nil
}

// UpdateUserPassword met à jour le mot de passe de l'utilisateur
func UpdateUserPassword(client *mongo.Client, userID string, newPassword string) error {
	coll := client.Database("DB").Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Erreur lors de la conversion de l'ID utilisateur en ObjectID : %v\n", err)
		return err
	}

	result, err := coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"password": newPassword}},
	)
	if err != nil {
		log.Printf("Erreur lors de la mise à jour du mot de passe de l'utilisateur : %v\n", err)
		return err
	}

	if result.ModifiedCount == 0 {
		return errors.New("Aucune mise à jour effectuée")
	}

	log.Printf("Mot de passe de l'utilisateur mis à jour avec succès. Documents affectés: %v\n", result.ModifiedCount)
	return nil
}

func GetUserByUsername(client *mongo.Client, username string) (model.User, error) {
	var user model.User
	collection := client.Database("DB").Collection("users")

	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		log.Printf("Erreur lors de la recherche de l'utilisateur: %v\n", err)
		return user, err
	}
	return user, nil
}

// Quiz non terminé par un utilisateur
func OnGoingQuiz(client *mongo.Client, userName string) (bool, model.Quiz) {
	filter := bson.M{"username": userName, "finish": false}

	var quiz model.Quiz
	coll := client.Database("DB").Collection("Quiz")
	err := coll.FindOne(context.TODO(), filter).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, model.Quiz{}
		}
		return false, model.Quiz{}
	}
	return true, quiz
}

// Create a Quiz
func CreateQuiz(client *mongo.Client, quiz model.Quiz) (model.Quiz, error) {
	coll := client.Database("DB").Collection("Quiz")
	log.Println("Création d'un quiz par l'API externe")
	_, err := coll.InsertOne(context.TODO(), quiz)
	return quiz, err
}

func GetQuizByID(client *mongo.Client, quizID string) (model.Quiz, error) {
	var quiz model.Quiz
	collection := client.Database("DB").Collection("Quiz")

	objID, err := primitive.ObjectIDFromHex(quizID)
	if err != nil {
		return quiz, err
	}

	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&quiz)
	return quiz, err
}

func UpdateQuiz(client *mongo.Client, quiz model.Quiz) (*mongo.UpdateResult, error) {
	coll := client.Database("DB").Collection("Quiz")
	objID, err := primitive.ObjectIDFromHex(quiz.ID)
	if err != nil {
		log.Printf("Erreur lors de la conversion de l'ID du quiz en ObjectID : %v\n", err)
		return nil, err
	}

	updateData := bson.M{
		"username":        quiz.Username,
		"questions":       quiz.Questions,
		"mark":            quiz.Mark,
		"finish":          quiz.Finish,
		"number_question": quiz.Number_question,
	}

	log.Printf("Mise à jour du quiz avec l'ID : %s\n", quiz.ID)
	return coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{
			"$set": updateData,
		},
	)
}

func UpdateUser(client *mongo.Client, user model.User) (*mongo.UpdateResult, error) {
	coll := client.Database("DB").Collection("users")
	objID, err := primitive.ObjectIDFromHex(user.ID)
	if err != nil {
		log.Printf("Erreur lors de la conversion de l'ID utilisateur en ObjectID : %v\n", err)
		return nil, err
	}

	updateData := bson.M{
		"level":                user.Level,
		"coins":                user.Coins,
		"inventory":            user.Inventory,
		"stats.quizzes_played": user.Stats.PlayedQuizzes,
		"stats.quizzes_win":    user.Stats.WinQuizzes,
	}

	log.Printf("Mise à jour de l'inventaire de l'utilisateur avec l'ID : %s\n", user.ID)
	return coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{
			"$set": updateData,
		},
	)

}

func CreateQuestion(client *mongo.Client, userName string, categoryName string, question model.Question) error {
	coll := client.Database("DB").Collection("categories")
	filter := bson.M{"categoryname": categoryName}

	// Vérifier si la catégorie existe déjà
	var existingCategory model.Category
	err := coll.FindOne(context.TODO(), filter).Decode(&existingCategory)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// La catégorie n'existe pas, créer un nouveau document
			newCategory := model.Category{
				Username:     userName,
				CategoryName: categoryName,
				Questions:    []model.Question{question},
			}
			_, err = coll.InsertOne(context.TODO(), newCategory)
			if err != nil {
				log.Printf("Erreur lors de la création de la catégorie : %v", err)
				return err
			}
			return nil
		}
		log.Printf("Erreur lors de la vérification de la catégorie : %v", err)
		return err
	}

	// La catégorie existe, ajouter la question à la liste des questions
	update := bson.M{
		"$push": bson.M{"questions": question},
	}
	_, err = coll.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Printf("Erreur MongoDB: %v", err)
	}
	return err
}

func ExistQuestion(client *mongo.Client, userName string, categoryName string, question model.Question) (bool, model.Question, error) {
	filter := bson.M{
		"username":                userName,
		"categoryname":            categoryName,
		"questions.question_text": question.QuestionText,
	}

	log.Printf("🔎 Recherche de la question avec le filtre: %+v", filter)

	var result model.Category

	coll := client.Database("DB").Collection("categories")
	log.Println("collection existe : ", coll)
	err := coll.FindOne(context.TODO(), filter).Decode(&result)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("🚨 Aucune question trouvée pour : %s", question.QuestionText)
			return false, model.Question{}, nil
		}
		log.Printf("❌ Erreur MongoDB : %v", err)
		return false, model.Question{}, err
	}

	log.Printf("✅ Question trouvée dans la catégorie %s", categoryName)
	return true, question, nil
}

func GetQuestionsByCategory(client *mongo.Client, userName string, categoryName string) []model.Question {
	filter := bson.M{"username": userName, "categoryname": categoryName}
	var category model.Category
	coll := client.Database("DB").Collection("categories")
	err := coll.FindOne(context.TODO(), filter).Decode(&category)
	if err != nil {
		return []model.Question{}
	}
	return category.Questions
}

func GetCheatSheet(client *mongo.Client, userName string, number_pull int) ([]int, error) {
	coll := client.Database("DB").Collection("users")

	var user model.User
	err := coll.FindOne(context.TODO(), bson.M{"username": userName}).Decode(&user)
	if err != nil {
		log.Printf("❌ Erreur récupération utilisateur: %v\n", err)
		return nil, err
	}

	log.Printf("✅ Utilisateur trouvé: %v", user)

	var price int = number_pull * 100
	if number_pull == 10 {
		price = 900
	}

	if user.Coins < price {
		log.Printf("❌ Pas assez de pièces: %d disponibles, %d nécessaires\n", user.Coins, price)
		return nil, errors.New("Pas assez de pièces")
	}

	var result []int

	// Mise à jour de l'inventaire
	for i := 0; i < number_pull; i++ {
		randomValue := rand.Float64()
		var rarity int
		if randomValue <= 0.05 {
			rarity = 5
		} else if randomValue <= 0.2 {
			rarity = 4
		} else {
			rarity = 3
		}

		for j := range user.Inventory {
			if user.Inventory[j].Rarity == rarity {
				user.Inventory[j].Quantity++
				result = append(result, rarity)
				break
			}
		}
	}

	user.Coins -= price
	log.Printf("💰 Mise à jour des pièces: %d", user.Coins)

	_, err = coll.UpdateOne(
		context.TODO(),
		bson.M{"username": userName},
		bson.M{
			"$set": bson.M{
				"coins":     user.Coins,
				"inventory": user.Inventory,
			},
		},
	)
	if err != nil {
		log.Printf("❌ Erreur mise à jour MongoDB: %v\n", err)
	}
	return result, err
}

func GetUserCategories(client *mongo.Client, username string) ([]model.Category, error) {
	collection := client.Database("DB").Collection("categories")

	// Filtrer par username
	filter := bson.M{"username": username}

	// Trouver les documents
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Printf("Erreur lors de la recherche des catégories : %v", err)
		return nil, err
	}
	defer cursor.Close(context.TODO())

	// Convertir les résultats en slice
	var categories []model.Category
	if err = cursor.All(context.TODO(), &categories); err != nil {
		log.Printf("Erreur lors du décodage des catégories : %v", err)
		return nil, err
	}

	return categories, nil
}

func CategoryExists(client *mongo.Client, username string, categoryName string) (bool, error) {
	collection := client.Database("DB").Collection("categories")
	filter := bson.M{"username": username, "categoryname": categoryName}
	count, err := collection.CountDocuments(context.TODO(), filter)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func CreateCategory(client *mongo.Client, username string, categoryName string, questions []model.Question) error {
	collection := client.Database("DB").Collection("categories")

	category := bson.M{
		"username":     username,
		"categoryname": categoryName,
		"questions":    questions,
	}

	_, err := collection.InsertOne(context.TODO(), category)
	return err
}

func UseCheatSheet(client *mongo.Client, quizID string, rarity int) ([]string, error) {
	coll := client.Database("DB").Collection("Quiz")

	// Récupérer le quiz
	objID, err := primitive.ObjectIDFromHex(quizID)
	if err != nil {
		log.Printf("❌ Erreur lors de la conversion de l'ID du quiz en ObjectID : %v\n", err)
		return nil, err
	}

	var quiz model.Quiz
	err = coll.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&quiz)
	if err != nil {
		log.Printf("❌ Erreur lors de la récupération du quiz : %v\n", err)
		return nil, err
	}

	var hints int = 0
	if rarity == 5 {
		hints = 3
	}
	if rarity == 4 {
		hints = 2
	}
	if rarity == 3 {
		hints = 1
	}

	var allHints []string
	currentQuestion := quiz.Questions[quiz.Number_question]
	for _, response := range currentQuestion.Responses {
		if response != currentQuestion.ResponseCorrect {
			allHints = append(allHints, response)
		}
	}

	// Mélanger les réponses
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(allHints), func(i, j int) { allHints[i], allHints[j] = allHints[j], allHints[i] })

	// Sélectionner le nombre d'indices requis
	var result []string
	for i := 0; i < hints && i < len(allHints); i++ {
		result = append(result, allHints[i])
	}

	//Mettre a jour les cheatsheets de l'user
	userColl := client.Database("DB").Collection("users")
	// filter := bson.M{"username": quiz.Username}
	// update := bson.M{"$pull": bson.M{"inventory": bson.M{"rarity": rarity, "quantity": 1}}}
	// _, err = userColl.UpdateOne(context.TODO(), filter, update)
	filter := bson.M{"username": quiz.Username, "inventory.rarity": rarity}
	update := bson.M{"$inc": bson.M{"inventory.$.quantity": -1}}
	_, err = userColl.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Printf("❌ Erreur lors de la mise à jour de l'inventaire de l'utilisateur : %v\n", err)
		return nil, err
	}

	return result, nil
}
