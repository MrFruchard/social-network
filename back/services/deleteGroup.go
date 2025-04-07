package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func DeleteGroup(db *sql.DB, userId, groupId string) error {
	var owner string
	query := `SELECT OWNER FROM ALL_GROUPS WHERE ID = ?`
	err := db.QueryRow(query, groupId).Scan(&owner)
	if err != nil {
		return err
	}
	if owner != userId {
		return errors.New("Not allowed to delete this group")
	}

	query = `DELETE FROM ALL_GROUPS WHERE ID = ?`
	_, err = db.Exec(query, groupId)
	if err != nil {
		return err
	}

	return nil
}
