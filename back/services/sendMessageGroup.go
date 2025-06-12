package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

type MessageGroup struct {
	ID          string `json:"id"`
	GroupID     string `json:"group_id"`
	SenderID    string `json:"sender_id"`
	Content     string `json:"content"`
	Type        int    `json:"type"` // 0 = text, 1 = image
	CreatedAt   string `json:"created_at"`
	Sender      User   `json:"sender"`
}

func SendMessageGroup(db *sql.DB, userId, groupID string) ([]MessageGroup, error) {
	var messages []MessageGroup

	// Vérifier que l'utilisateur est membre du groupe
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userId, groupID).Scan(&isMember)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("User is not member of group")
	}

	// Récupérer tous les messages du groupe
	query = `SELECT ID, SENDER_ID, CONTENT, TYPE, CREATED_AT FROM MESSAGES WHERE GROUP_ID = ? ORDER BY CREATED_AT ASC`
	rows, err := db.Query(query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var msg MessageGroup
		var typeMessage int

		err = rows.Scan(&msg.ID, &msg.SenderID, &msg.Content, &typeMessage, &msg.CreatedAt)
		if err != nil {
			continue
		}

		msg.GroupID = groupID
		msg.Type = typeMessage

		// Récupérer les infos de l'expéditeur
		var username, image sql.NullString
		userQuery := `SELECT ID, FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`
		err = db.QueryRow(userQuery, msg.SenderID).Scan(
			&msg.Sender.ID,
			&msg.Sender.Firstname,
			&msg.Sender.Lastname,
			&image,
			&username,
		)
		if err == nil {
			if username.Valid {
				msg.Sender.Username = username.String
			}
			if image.Valid {
				msg.Sender.ProfilePic = image.String
			}
		}

		messages = append(messages, msg)
	}

	return messages, nil
}

// Fonction pour envoyer un message dans un groupe
func CreateGroupMessage(db *sql.DB, userID, groupID, content string, typeMessage int) (string, string, error) {
	// Vérifier que l'utilisateur est membre du groupe
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupID).Scan(&isMember)
	if err != nil {
		return "", "", errors.Wrap(err, "failed to check group membership")
	}
	if !isMember {
		return "", "", errors.New("user is not a member of the group")
	}

	// Créer un ID pour le message
	msgID := uuid.New().String()
	convID := groupID // Utiliser le groupID comme conversation ID

	// Insérer le message
	query = `
		INSERT INTO MESSAGES(ID, SENDER_ID, CONVERSATION_ID, CONTENT, TYPE, GROUP_ID, CREATED_AT)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
	`
	_, err = db.Exec(query, msgID, userID, convID, content, typeMessage, groupID)
	if err != nil {
		return "", "", errors.Wrap(err, "failed to insert group message")
	}

	return convID, msgID, nil
}