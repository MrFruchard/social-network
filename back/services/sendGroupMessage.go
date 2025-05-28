package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func SendGroupMessage(db *sql.DB, userID, groupID, content string, typeMessage int) (string, string, error) {
	var isMember bool

	// Vérification si l'utilisateur est membre du groupe
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupID).Scan(&isMember)
	if err != nil {
		return "", "", errors.Wrap(err, "failed to check group membership")
	}
	if !isMember {
		return "", "", errors.New("user is not a member of the group")
	}

	// Création d'un ID pour le message
	msgID := uuid.New().String()
	convID := groupID // ici, tu utilises le groupID comme conversation ID logique

	// Insertion du message
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
