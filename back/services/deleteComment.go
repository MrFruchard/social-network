package services

import (
	"database/sql"
	"errors"
	"fmt"
)

func DeleteComment(db *sql.DB, userId, commentId string) error {
	var dbUserID string

	query := `SELECT USER_ID FROM COMMENT WHERE ID = ? `
	err := db.QueryRow(query, commentId).Scan(&dbUserID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("post not found")
		}
		return fmt.Errorf("error fetching post owner: %w", err)
	}

	if dbUserID != userId {
		return errors.New("user ID does not match")
	}

	return nil
}
