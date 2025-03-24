package services

import (
	"database/sql"
	"errors"
	"fmt"
)

func DeleteComment(db *sql.DB, userId, commentId string) error {
	// Suppression conditionnelle du commentaire
	query := `DELETE FROM COMMENT WHERE ID = ? AND USER_ID = ?`
	res, err := db.Exec(query, commentId, userId)
	if err != nil {
		return fmt.Errorf("error executing delete statement: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error retrieving affected rows: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("comment not found or user not authorized")
	}

	return nil
}
