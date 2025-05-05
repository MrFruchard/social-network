package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func SendInvitationGroup(db *sql.DB, userID, receiverId, groupId string) error {
	var isMember bool
	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userID, groupId).Scan(&isMember)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("user is not a member of the group")
	}

	var receiverIsMember bool
	query = `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err = db.QueryRow(query, receiverId, groupId).Scan(&receiverIsMember)
	if err != nil {
		return err
	}
	if receiverIsMember {
		return errors.New("receiver is already a member of the group")
	}

	var isFollower bool
	query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
	err = db.QueryRow(query, receiverId, userID).Scan(&isFollower)
	if err != nil {
		return err
	}
	if !isFollower {
		return errors.New("user is not a follower")
	}

	var isAlreadyInvite bool
	query = `SELECT EXISTS(SELECT 1 FROM ASK_GROUP WHERE RECEIVER = ? AND GROUP_ID = ?)`
	err = db.QueryRow(query, receiverId, groupId).Scan(&isAlreadyInvite)
	if err != nil {
		return err
	}
	if isAlreadyInvite {
		return errors.New("invitation to group already exists")
	}

	tx, err := db.Begin()
	if err != nil {
		return errors.Wrap(err, "transaction begin failed")
	}
	defer tx.Rollback()

	idNotif := uuid.New().String()
	idAsk := uuid.New().String()

	// Insertion de la notification (sans champ MESSAGE)
	query = `INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE) VALUES (?, ?, ?, ?)`
	_, err = tx.Exec(query, idNotif, "INVITE_GROUP", receiverId, idAsk)
	if err != nil {
		return errors.Wrap(err, "failed to insert notification")
	}

	// Insertion de la demande d'invitation
	query = `INSERT INTO ASK_GROUP(ID, ASKER, RECEIVER, GROUP_ID, CREATED_AT) VALUES (?, ?, ?, ?, datetime('now'))`
	_, err = tx.Exec(query, idAsk, userID, receiverId, groupId)
	if err != nil {
		return errors.Wrap(err, "failed to insert ask group")
	}

	// Commit de la transaction
	if err = tx.Commit(); err != nil {
		return errors.Wrap(err, "transaction commit failed")
	}

	return nil
}
