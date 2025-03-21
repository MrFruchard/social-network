package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AddRequestFollowHandler(db *sql.DB, userID, receiver string) error {
	// Vérifie si une demande existe déjà
	var requestID string
	query := `SELECT ID FROM REQUEST_FOLLOW WHERE RECEIVER_ID = ? AND ASKER_ID = ?`
	err := db.QueryRow(query, receiver, userID).Scan(&requestID)
	if err == nil {
		return errors.New("request already exists")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	// Vérifie si le receiver existe
	var receiverID string
	query = `SELECT ID FROM USER WHERE ID = ?`
	err = db.QueryRow(query, receiver).Scan(&receiverID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("receiver does not exist")
		}
		return err
	}

	// Ajoute la nouvelle demande
	id := uuid.New().String()
	query = `INSERT INTO REQUEST_FOLLOW (ID, RECEIVER_ID, ASKER_ID, STATUS, CREATED_AT) VALUES (? ,?, ?, 'pending', datetime('now'))`
	_, err = db.Exec(query, id, receiver, userID)
	if err != nil {
		return err
	}

	return nil
}
