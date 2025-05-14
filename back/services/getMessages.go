package services

import (
	"database/sql"
	"log"
)

type AllMessages struct {
	Members  []Members  `json:"members"`
	Messages []Messages `json:"messageImages"`
}

type Messages struct {
	ID        string `json:"id"`
	Sender    string `json:"sender"`
	Content   string `json:"content"`
	ConvID    string `json:"conv_id"`
	Seen      bool   `json:"seen"`
	IsImage   bool   `json:"isImage"`
	CreatedAt string `json:"createdAt"`
}

type Members struct {
	UserId     string `json:"user_id"`
	LastName   string `json:"last_name"`
	FirstName  string `json:"first_name"`
	Username   string `json:"username"`
	ProfilePic string `json:"profilePic"`
}

func GetMessages(db *sql.DB, userID, convID string) (AllMessages, error) {
	var m AllMessages

	var isMember bool
	queryCheck := `SELECT EXISTS(SELECT 1 FROM CONVERSATION_MEMBERS WHERE CONVERSATION_ID = ? AND USER_ID = ?)`
	err := db.QueryRow(queryCheck, convID, userID).Scan(&isMember)
	if err != nil {
		return m, err
	}
	if !isMember {
		log.Println("is not member in this convID")
		return m, nil
	}

	queryUser := `SELECT USER_ID FROM CONVERSATION_MEMBERS WHERE CONVERSATION_ID = ?`
	rowsUsers, err := db.Query(queryUser, convID)
	if err != nil {
		return m, err
	}
	defer rowsUsers.Close()

	for rowsUsers.Next() {
		var u Members
		err = rowsUsers.Scan(&u.UserId)
		if err != nil {
			return m, err
		}

		var pdp sql.NullString
		query := `SELECT LASTNAME, FIRSTNAME, USERNAME,IMAGE FROM USER WHERE ID = ?`
		err = db.QueryRow(query, u.UserId).Scan(&u.LastName, &u.FirstName, &u.Username, &pdp)
		if err != nil {
			return m, err
		}
		if pdp.Valid {
			u.ProfilePic = pdp.String
		}

		m.Members = append(m.Members, u)
	}

	query := `SELECT ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT FROM MESSAGES WHERE CONVERSATION_ID = ?`
	rows, err := db.Query(query, convID)
	if err != nil {
		return m, err
	}
	defer rows.Close()

	for rows.Next() {
		var mes Messages
		var typeMessage int
		err = rows.Scan(&mes.ID, &mes.Sender, &mes.ConvID, &mes.Content, &mes.Seen, &typeMessage, &mes.CreatedAt)
		if err != nil {
			return m, err
		}
		if typeMessage == 1 {
			mes.IsImage = true
		} else {
			mes.IsImage = false
		}
		m.Messages = append(m.Messages, mes)
	}

	return m, nil
}
