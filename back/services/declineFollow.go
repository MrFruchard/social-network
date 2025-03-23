package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func DeclineFollow(db *sql.DB, userID, target string) error {
	var id string

	query := `SELECT ID FROM REQUEST_FOLLOW WHERE RECEIVER_ID = ? AND ASKER_ID = ?`
	err := db.QueryRow(query, userID, target).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("follow request not found")
		}
		return errors.Wrap(err, "error selecting follow request")
	}

	query = `DELETE FROM REQUEST_FOLLOW WHERE ID = ?`
	_, err = db.Exec(query, id)
	if err != nil {
		return errors.Wrap(err, "error deleting follow request")
	}

	return nil
}
