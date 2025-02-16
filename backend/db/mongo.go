package db

import (
	"context"
	"errors"
	"log"
	"os"
	"quizmaster/model"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Fatal(err)
	}
	return client
}

// se connecte à la base de données et vérifie les identifiants de l'utilisateur
func Login(client *mongo.Client, username, password string) (LoginResponse, error) {
	coll := client.Database("DB").Collection("users")

	var user model.User
	err := coll.FindOne(context.TODO(), bson.M{"username": username, "password": password}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return LoginResponse{Status: 401, Message: "Identifiants invalides"}, nil
		}
		return LoginResponse{}, err
	}

	log.Printf("Authentification réussie pour l'utilisateur %s\n", user.Username)

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
	coll := client.Database("DB").Collection("users")
	count, err := coll.CountDocuments(context.TODO(), bson.M{"username": username})
	if err != nil {
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
