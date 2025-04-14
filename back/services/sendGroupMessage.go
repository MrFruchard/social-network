package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func SendGroupMessage(db *sql.DB, userID, groupID, content string, typeMessage int) error {
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ?  AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupID).Scan(&isMember)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("User is not a member of the group")
	}

	

	return nil
}
