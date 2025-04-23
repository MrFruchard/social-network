package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func SendGroupMessage(db *sql.DB, userID, groupID, content string, typeMessage int) error {
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupID).Scan(&isMember)
	if err != nil {
		return errors.Wrap(err, "failed to check group membership")
	}
	if !isMember {
		return errors.New("user is not a member of the group")
	}

	id := uuid.New().String()

	query = `
		INSERT INTO MESSAGES(ID, SENDER_ID, CONVERSATION_ID, CONTENT, TYPE, GROUP_ID, CREATED_AT)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
	`
	_, err = db.Exec(query, id, userID, groupID, content, typeMessage, groupID)
	if err != nil {
		return errors.Wrap(err, "failed to insert group message")
	}

	return nil
}
