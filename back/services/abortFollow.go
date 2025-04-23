package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func AbortFollow(db *sql.DB, userID, targetID string) error {
	var isOnRequest bool
	query := `SELECT EXISTS ( SELECT 1 FROM REQUEST_FOLLOW WHERE RECEIVER_ID =? AND ASKER_ID =?)`
	err := db.QueryRow(query, targetID, userID).Scan(&isOnRequest)
	if err != nil {
		return err
	}

	if !isOnRequest {
		return errors.New("User is not on request")
	}

	query = `DELETE FROM REQUEST_FOLLOW WHERE RECEIVER_ID =? AND ASKER_ID =?`
	_, err = db.Exec(query, targetID, userID)
	if err != nil {
		return err
	}

	return nil
}
