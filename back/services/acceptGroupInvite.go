package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AcceptGroupInvite(db *sql.DB, userId, groupID string) error {
	var isMember, existInvitation bool

	query1 := `SELECT EXISTS (SELECT 1 FROM ASK_GROUP WHERE RECEIVER = ?  AND GROUP_ID = ?)`
	err1 := db.QueryRow(query1, userId, groupID).Scan(&existInvitation)
	if err1 != nil {
		return err1
	}
	if !existInvitation {
		return errors.New("invitation does not exist")
	}

	query := `SELECT EXISTS (SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND ID = ?)`
	err := db.QueryRow(query, userId, groupID).Scan(&isMember)
	if err != nil {
		return err
	}
	if isMember {
		return errors.New("you are already a member of this group")
	}

	queryUpdate := `UPDATE ASK_GROUP SET ACCEPTED = ?  WHERE RECEIVER = ? AND GROUP_ID = ?`
	_, err = db.Exec(queryUpdate, 1, userId, groupID)
	if err != nil {
		return err
	}

	id := uuid.New().String()
	addGroupQuery := `INSERT INTO GROUPS_MEMBERS(ID, USER_ID, GROUP_ID, CREATED_AT) VALUES (?,?,?,datetime('now'))`
	_, err = db.Exec(addGroupQuery, id, userId, groupID)
	if err != nil {
		return err
	}
	
	return nil
}
