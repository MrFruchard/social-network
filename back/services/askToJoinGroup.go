package services

import (
	"database/sql"
)

func AskToJoinGroup(db *sql.DB, groupID, userID string) error {
	var groupOwner string

	query := `SELECT OWNER FROM ALL_GROUPS WHERE ID = ?`
	err := db.QueryRow(query, groupID).Scan(&groupOwner)
	if err != nil {
		return err
	}

	return nil
}
