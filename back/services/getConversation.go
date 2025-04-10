package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

type ListConversation struct {
	ConvID      string      `json:"conv"` //x
	User        []User      `json:"user"` //x
	LastMessage LastMessage `json:"last_Message"`
}

type LastMessage struct {
	ID      string `json:"id"`      //x
	UserID  User   `json:"user_id"` //x
	Content string `json:"content"` //x
	SendAt  string `json:"date"`    //x
	Read    bool   `json:"read"`    //
	Type    string `json:"type"`    //x
}

type User struct {
	ID         string `json:"id"`         //
	Username   string `json:"username"`   //
	ProfilePic string `json:"image"`      //null
	Lastname   string `json:"last_name"`  //
	Firstname  string `json:"first_name"` //
}

func GetConversation(db *sql.DB, userId string) ([]ListConversation, error) {
	var l []ListConversation

	query := `SELECT CONVERSATION_ID FROM CONVERSATION_MEMBERS WHERE USER_ID = ?`
	rows, err := db.Query(query, userId)
	if err != nil {
		return l, errors.New("Failed to get conversation")
	}
	defer rows.Close()

	for rows.Next() {
		var c ListConversation
		err = rows.Scan(&c.ConvID)
		if err != nil {
			return l, errors.New("failed to scan conversation")
		}

		// Récupérer les membres de la conversation (hors user actuel)
		usersQuery := `SELECT USER_ID FROM CONVERSATION_MEMBERS WHERE CONVERSATION_ID = ?`
		userRows, err := db.Query(usersQuery, c.ConvID)
		if err != nil {
			return l, errors.New("Failed to get users from conversation")
		}

		var members []User
		for userRows.Next() {
			var u User
			err = userRows.Scan(&u.ID)
			if err != nil {
				return l, errors.New("failed to scan user")
			}

			if u.ID == userId {
				continue
			}

			var image sql.NullString
			queryInfo := `SELECT ID, USERNAME, LASTNAME, FIRSTNAME, IMAGE FROM USER WHERE ID = ?`
			err = db.QueryRow(queryInfo, u.ID).Scan(&u.ID, &u.Username, &u.Lastname, &u.Firstname, &image)
			if err != nil {
				return l, errors.New("Failed to get user info")
			}

			if image.Valid {
				u.ProfilePic = image.String
			}
			members = append(members, u)
		}
		userRows.Close()

		// Dernier message
		var lastMsg LastMessage
		var sender User
		var senderImage sql.NullString
		var typeMessage int

		queryLast := `
			SELECT m.ID, m.SENDER_ID, m.CONTENT, m.SEEN, m.TYPE, m.CREATED_AT,
			       u.ID, u.USERNAME, u.IMAGE, u.LASTNAME, u.FIRSTNAME
			FROM MESSAGES m
			JOIN USER u ON m.SENDER_ID = u.ID
			WHERE m.CONVERSATION_ID = ?
			ORDER BY m.CREATED_AT DESC
			LIMIT 1`

		err = db.QueryRow(queryLast, c.ConvID).Scan(
			&lastMsg.ID,
			&sender.ID,
			&lastMsg.Content,
			&lastMsg.Read,
			&typeMessage,
			&lastMsg.SendAt,
			&sender.ID,
			&sender.Username,
			&senderImage,
			&sender.Lastname,
			&sender.Firstname,
		)
		if err == nil {
			if senderImage.Valid {
				sender.ProfilePic = senderImage.String
			}
			lastMsg.UserID = sender
			c.LastMessage = lastMsg
		}

		if typeMessage == 0 {
			lastMsg.Type = "content"
		} else if typeMessage == 1 {
			lastMsg.Type = "image"
		}

		c.User = members
		l = append(l, c) // <<< Important ! Ajouter la conversation à la liste
	}

	return l, nil
}
