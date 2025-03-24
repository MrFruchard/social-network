package services

import (
	"database/sql"
	"github.com/google/uuid"
)

func AcceptFollow(db *sql.DB, userID, askerId string) error {

	var requestID string
	query := `SELECT ID FROM REQUEST_FOLLOW WHERE RECEIVER_ID = ? AND ASKER_ID = ?`
	err := db.QueryRow(query, userID, askerId).Scan(&requestID)
	if err != nil {
		return err
	}

	id := uuid.New().String()

	query = `INSERT INTO FOLLOWERS (ID, USER_ID, FOLLOWERS, CREATED_AT) VALUES (?, ?, ?, datetime('now'))`
	_, err = db.Exec(query, id, userID, askerId)
	if err != nil {
		return err
	}

	query = `UPDATE REQUEST_FOLLOW SET STATUS = ? WHERE ID = ?`
	_, err = db.Exec(query, "accepted", requestID)
	if err != nil {
		return err
	}
	return nil
}
