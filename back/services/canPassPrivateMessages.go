package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func CanPassPrivateMessages(db *sql.DB, userId, id string) error {
	var convId string

	query := `SELECT CONVERSATION_ID FROM MESSAGES WHERE CONTENT = ?`
	err := db.QueryRow(query, id).Scan(&convId)
	if err != nil {
		return err
	}

	var isMember bool
	query = `SELECT EXISTS(SELECT 1 FROM CONVERSATION_MEMBERS WHERE CONVERSATION_ID = ? AND USER_ID = ?) `
	err = db.QueryRow(query, convId, userId).Scan(&isMember)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("CanPassPrivateMessages: User does not have member of this conversation")
	}

	return nil
}
