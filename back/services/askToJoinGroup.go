package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AskToJoinGroup(db *sql.DB, groupID, userID string) error {
	var isOwner bool

	query := `SELECT EXISTS( SELECT 1 FROM ALL_GROUPS WHERE OWNER = ? AND ID = ? )`
	err := db.QueryRow(query, userID, groupID).Scan(&isOwner)
	if err != nil {
		return err
	}

	if isOwner {
		return errors.New("you can not ask to join you are the owner of this group")
	}

	var owner string
	query = `SELECT OWNER FROM ALL_GROUPS WHERE ID = ?`
	err = db.QueryRow(query, groupID).Scan(&owner)
	if err != nil {
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		return errors.Wrap(err, "transaction begin failed")
	}
	defer tx.Rollback()

	askId := uuid.New().String()
	notifId := uuid.New().String()
	query = `INSERT INTO ASK_GROUP(ID, ASKER, RECEIVER, GROUP_ID, ACCEPTED, CREATED_AT) VALUES (?, ?, ?, ?, 0 , datetime('now'))`
	_, err = db.Exec(query, askId, userID, owner, groupID)
	if err != nil {
		return err
	}

	query = `INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE) VALUES (?,?,?,?)`
	_, err = db.Exec(query, notifId, "ASK_GROUP", userID, askId)
	if err != nil {
		return err
	}

	return nil
}
