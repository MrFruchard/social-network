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
	var public int

	query = `SELECT ID , PUBLIC FROM USER WHERE ID = ?`
	err = db.QueryRow(query, receiver).Scan(&receiverID, &public)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("receiver does not exist")
		}
		return err
	}

	if public == 1 {
		err = insertFollow(userID, receiver, db)
		if err != nil {
			return err
		}
		return nil
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

func insertFollow(userId, receiver string, db *sql.DB) error {
	var requestID string
	query2 := "SELECT ID FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?"
	err := db.QueryRow(query2, receiver, userId).Scan(&requestID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			id := uuid.New().String()
			query := `INSERT INTO FOLLOWERS (ID, USER_ID, FOLLOWERS, CREATED_AT) VALUES (?, ?, ?, datetime('now'))`
			_, err = db.Exec(query, id, receiver, userId)
			if err != nil {
				return err
			}
			return nil
		}
		return err
	}

	return nil
}
