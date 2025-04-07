package services

import (
	"database/sql"
	"errors"
)

func DeleteFollower(db *sql.DB, userID, followerID string) error {
	// Vérifier que l'utilisateur existe
	var exists bool
	queryCheck := `SELECT EXISTS(SELECT 1 FROM USER WHERE ID = ?)`
	err := db.QueryRow(queryCheck, followerID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("utilisateur non trouvé")
	}

	// Supprimer le follower
	query := `DELETE FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?`
	_, err = db.Exec(query, userID, followerID)
	return err
}
