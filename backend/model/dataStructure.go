package dataStructure

type User struct {
	ID             	string `bson:"_id,omitempty"`
	Username        string `bson:"username"`
	Password        string `bson:"password"`
	Token          	string `bson:"token"`
	Level		  	int    `bson:"level"`
	Coins		  	int    `bson:"coins"`
	Inventory	  	[]Antiseche `bson:"inventory"`
	Stats 		   	Stats  `bson:"stats"`
}

type Stats struct {
	PlayedQuizzes 	int `bson:"quizzes_played" json:"quizzes_played"`
	WinQuizzes 		int `bson:"quizzes_win" json:"quizzes_win"`
}

type Antiseche struct {
	UserID string `bson:"user_id"`
	Rarity int `bson:"rarity"`
}


type Quiz struct {
	UserID    			string `bson:"user_id"`
	Questions 			[]Question `bson:"questions"`
	Note	  			int `bson:"note"`
	Termine  			bool `bson:"termine"`
	Number_question 	int `bson:"number_question"`
}


type Question struct {
	QuestionText 	string   `bson:"question_text" json:"question_text"`
	Reponses     	[]string `bson:"reponses" json:"reponses"`
	ReponseCorrect 	string   `bson:"reponse_correct" json:"reponse_correct"`

}