package services

import (
	"database/sql"
	"log"

	"github.com/pkg/errors"
)

type MessageGroup struct {
	User     User     `json:"user"`
	Messages Messages `json:"messages"`
	GroupID  string   `json:"groupID"`
}

func SendMessageGroup(db *sql.DB, userId, groupID string) ([]MessageGroup, error) {
	log.Printf("Checking if user %s is a member of group %s", userId, groupID)
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userId, groupID).Scan(&isMember)
	if err != nil {
		//log.Printf("Error checking group membership: %v", err)
		return nil, err
	}
	if !isMember {
		//log.Printf("User %s is not a member of group %s", userId, groupID)
		return nil, errors.New("User is not member of group")
	}

	log.Printf("User %s is a member of group %s. Fetching messages...", userId, groupID)
	query = `SELECT ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, GROUP_ID, CREATED_AT FROM MESSAGES WHERE GROUP_ID = ?`
	rows, err := db.Query(query, groupID)
	if err != nil {
		//log.Printf("Error fetching messages: %v", err)
		return nil, err
	}
	defer rows.Close()

	var m []MessageGroup
	for rows.Next() {
		var mes MessageGroup
		var isImage int
		err = rows.Scan(
			&mes.Messages.ID,
			&mes.Messages.Sender,
			&mes.Messages.ConvID,
			&mes.Messages.Content,
			&mes.Messages.Seen,
			&isImage,
			&mes.GroupID,
			&mes.Messages.CreatedAt,
		)
		if err != nil {
			//log.Printf("Error scanning message row: %v", err)
			return nil, err
		}

		mes.Messages.IsImage = isImage == 1
		//log.Printf("Fetched message ID %s from sender %s (isImage: %v)", mes.Messages.ID, mes.Messages.Sender, mes.Messages.IsImage)

		var username, image sql.NullString

		query = `SELECT ID, FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`
		//log.Printf("Fetching user data for sender ID %s", mes.User.ID)
		err = db.QueryRow(query, mes.Messages.Sender).Scan(
			&mes.User.ID,
			&mes.User.Firstname,
			&mes.User.Lastname,
			&image,
			&username,
		)
		if err != nil {
			//log.Printf("Error fetching user data: %v", err)
			return nil, err
		}
		if username.Valid {
			mes.User.Username = username.String
		}
		if image.Valid {
			mes.User.ProfilePic = image.String
		}

		//log.Printf("Fetched user: %s %s (%s)", mes.User.Firstname, mes.User.Lastname, mes.User.Username)

		m = append(m, mes)
	}

	return m, nil
}
