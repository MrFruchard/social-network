package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func SendInvitationGroup(db *sql.DB, userID, receiverId, groupId string) error {
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID= ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupId).Scan(&isMember)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("user is not a member of the group")
	}

	var receiverIsMember bool
	query = `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID= ? AND GROUP_ID = ?)`
	err = db.QueryRow(query, receiverId, groupId).Scan(&receiverIsMember)
	if err != nil {
		return err
	}

	if receiverIsMember {
		return errors.New("receiver is a member of the group")
	}

	var isFollower bool
	query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
	err = db.QueryRow(query, receiverId, userID).Scan(&isFollower)
	if err != nil {
		return err
	}
	if !isFollower {
		return errors.New("user is not follower")
	}

	var isAlreadyInvite bool
	query = `SELECT EXISTS(SELECT 1 FROM ASK_GROUP WHERE ASKER = ? AND  RECEIVER = ?)`
	err = db.QueryRow(query, receiverId, groupId).Scan(&isAlreadyInvite)
	if err != nil {
		return err
	}
	if isAlreadyInvite {
		return errors.New("invitation group already exists")
	}

	// si une écriture échoue reviens en arrière
	tx, err := db.Begin()
	if err != nil {
		return errors.Wrap(err, "transaction begin failed")
	}
	defer tx.Rollback()

	idNotif := uuid.New().String()
	idASk := uuid.New().String()
	query = `INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE) VALUES (?,?,?,?)`
	_, err = db.Exec(query, idNotif, "INVITE_GROUP", receiverId, idASk)
	if err != nil {
		return err
	}

	query = `INSERT INTO ASK_GROUP(ID, ASKER, RECEIVER, GROUP_ID, CREATED_AT) VALUES (?,?,?,?,datetime('now'))`
	_, err = db.Exec(query, idASk, userID, receiverId, groupId)
	if err != nil {
		return err
	}

	return nil
}
