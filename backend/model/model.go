package model

type User struct {
	ID         string       `bson:"_id,omitempty"`
	Username   string       `bson:"username"`
	Password   string       `bson:"password"`
	Token      string       `bson:"token"`
	Experience int          `bson:"experience"`
	Coins      int          `bson:"coins"`
	Picture    string       `bson:"picture"`
	Inventory  []CheatSheet `bson:"inventory"`
	Stats      Stats        `bson:"stats"`
}

type Stats struct {
	PlayedQuizzes    int `bson:"quizzes_played" json:"quizzes_played"`
	CorrectResponses int `bson:"correct_responses" json:"correct_responses"`
	FullMarks        int `bson:"full_marks" json:"full_marks"`
	UsedCheatSheets  int `bson:"used_cheat_sheets" json:"used_cheat_sheets"`
}

type CheatSheet struct {
	Rarity   int `bson:"rarity" json:"rarity"`
	Quantity int `bson:"quantity" json:"quantity"`
}

type Category struct {
	Username     string     `json:"Username" bson:"username"`
	CategoryName string     `json:"CategoryName" bson:"categoryname"`
	Questions    []Question `json:"Questions" bson:"questions"`
}

type Quiz struct {
	ID              string     `json:"ID" bson:"_id,omitempty"`
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
