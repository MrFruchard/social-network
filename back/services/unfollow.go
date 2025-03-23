package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func Unfollow(db *sql.DB, userID, target string) error {
	// Vérifie si la relation existe
	queryCheck := "SELECT ID FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?"
	var id string
	err := db.QueryRow(queryCheck, target, userID).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("user not found")
		}
		return err
	}

	// Supprimer la relation
	queryDelete := "DELETE FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?"
	_, err = db.Exec(queryDelete, target, userID)
	if err != nil {
		return err
	}

	return nil
}
