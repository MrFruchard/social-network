package services

import (
	"database/sql"
	"github.com/google/uuid"
)

func AddNotification(db *sql.DB, notificationType, relatedId, userId string) error {
	var exists bool

	query := `SELECT EXISTS(SELECT 1 FROM NOTIFICATIONS WHERE ID_TYPE = ? AND USER_ID = ?)`
	err := db.QueryRow(query, relatedId, userId).Scan(&exists)
	if err != nil {
		return err
	}

	if exists {
		return nil
	}

	id := uuid.New().String()
	query = `
		INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE, READ, CREATED_AT) 
		VALUES (?, ?, ?, ?, 0, datetime('now'))
	`
	_, err = db.Exec(query, id, notificationType, userId, relatedId)
	return err
}
