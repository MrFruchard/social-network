package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
)

func CreateComment(userId, postId, content string, db *sql.DB) error {

	var existingPostID string

	query1 := `SELECT ID FROM POSTS WHERE ID = ?`
	err := db.QueryRow(query1, postId).Scan(&existingPostID)
	if err == sql.ErrNoRows {
		return errors.New("Post not found")
	}

	id := uuid.New().String()

	query := `INSERT INTO COMMENT (ID, POST_ID, USER_ID, CONTENT, IMAGE, CREATED, UPDATED_AT) VALUES (?, ?,? ,?,NULL,datetime('now'), datetime('now'))`
	_, err = db.Exec(query, id, postId, userId, content)
	if err != nil {
		return err
	}
	return nil
}
