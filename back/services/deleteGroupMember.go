package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func DeleteGroupMember(db *sql.DB, owner, userId, groupId string) error {
	var ownerID string
	query := `SELECT OWNER FROM ALL_GROUPS WHERE ID = ?`
	err := db.QueryRow(query, groupId).Scan(&ownerID)
	if err != nil {
		return err
	}
	if owner != ownerID {
		return errors.New("you are not the owner of this group")
	}

	query = `DELETE FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?`
	result, err := db.Exec(query, userId, groupId)
	if err != nil {
		return errors.Wrap(err, "failed to delete group member")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get number of affected rows")
	}
	if rowsAffected == 0 {
		return errors.New("no matching group member found to delete")
	}

	return nil
}
