package services

import (
	"database/sql"
	"errors"
	"fmt"
)

func DeletePost(db *sql.DB, postId, userId string) error {
	var dbUserID string

	query := `SELECT USER_ID FROM POSTS WHERE ID = ?`
	err := db.QueryRow(query, postId).Scan(&dbUserID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("post not found")
		}
		return fmt.Errorf("error fetching post owner: %w", err)
	}

	if dbUserID != userId {
		return errors.New("user ID does not match")
	}

	//  le post
	stmt, err := db.Prepare("DELETE FROM POSTS WHERE ID = ?")
	if err != nil {
		return fmt.Errorf("error preparing delete statement: %w", err)
	}
	defer stmt.Close()

	res, err := stmt.Exec(postId)
	if err != nil {
		return fmt.Errorf("error executing delete statement: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error retrieving affected rows: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("no post deleted, ID might be incorrect")
	}

	return nil
}
