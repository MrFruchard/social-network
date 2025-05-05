package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func ReadNotifications(db *sql.DB, userID, notifID string) error {
	var read sql.NullBool
	query := `SELECT READ FROM NOTIFICATIONS WHERE ID = ? AND USER_ID = ?`
	err := db.QueryRow(query, notifID, userID).Scan(&read)
	if err == sql.ErrNoRows {
		return errors.New("NOT FOUND")
	}
	if err != nil {
		return err
	}

	if read.Valid && read.Bool {
		return nil // Déjà lu
	}

	_, err = db.Exec(`UPDATE NOTIFICATIONS SET READ = 1 WHERE ID = ? AND USER_ID = ?`, notifID, userID)
	return err
}
