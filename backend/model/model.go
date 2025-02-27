package model

type User struct {
	ID        string       `bson:"_id,omitempty"`
	Username  string       `bson:"username"`
	Password  string       `bson:"password"`
	Token     string       `bson:"token"`
	Level     int          `bson:"level"`
	Coins     int          `bson:"coins"`
	Inventory []CheatSheet `bson:"inventory"`
	Stats     Stats        `bson:"stats"`
}

type Stats struct {
	PlayedQuizzes int `bson:"quizzes_played" json:"quizzes_played"`
	WinQuizzes    int `bson:"quizzes_win" json:"quizzes_win"`
}

type CheatSheet struct {
	Rarity   int `bson:"rarity" json:"rarity"`
	Quantity int `bson:"quantity" json:"quantity"`
}

type Category struct {
	Username     string     `bson:"username"`
	CategoryName string     `bson:"categoryname"`
	Questions    []Question `bson:"questions"`
}

type Quiz struct {
	ID              string     `bson:"_id,omitempty"`
	Username        string     `bson:"username"`
	Questions       []Question `bson:"questions"`
	Mark            int        `bson:"mark"`
	Finish          bool       `bson:"finish"`
	Number_question int        `bson:"number_question"`
}

type Question struct {
	QuestionText    string   `bson:"question_text" json:"question_text"`
	Responses       []string `bson:"responses" json:"responses"`
	ResponseCorrect string   `bson:"response_correct" json:"response_correct"`
}

type ApiResponse struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
