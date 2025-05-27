package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AskToJoinGroup(db *sql.DB, groupID, userID string) error {
	var isOwner bool

	// Vérifie si l'utilisateur est le propriétaire du groupe
	query := `SELECT EXISTS(SELECT 1 FROM ALL_GROUPS WHERE OWNER = ? AND ID = ?)`
	err := db.QueryRow(query, userID, groupID).Scan(&isOwner)
	if err != nil {
		return errors.Wrap(err, "failed to check group ownership")
	}
	if isOwner {
		return errors.New("you cannot ask to join your own group")
	}

	// Vérifie si une demande existe déjà
	var alreadyAsked bool
	query = `SELECT EXISTS(
		SELECT 1 FROM ASK_GROUP 
		WHERE ASKER = ? AND GROUP_ID = ? AND ACCEPTED = 0
	)`
	err = db.QueryRow(query, userID, groupID).Scan(&alreadyAsked)
	if err != nil {
		return errors.Wrap(err, "failed to check if ask already exists")
	}
	if alreadyAsked {
		return errors.New("you have already requested to join this group")
	}

	// Récupère le propriétaire du groupe
	var owner string
	query = `SELECT OWNER FROM ALL_GROUPS WHERE ID = ?`
	err = db.QueryRow(query, groupID).Scan(&owner)
	if err != nil {
		return errors.Wrap(err, "failed to get group owner")
	}

	// Démarre une transaction
	tx, err := db.Begin()
	if err != nil {
		return errors.Wrap(err, "transaction begin failed")
	}
	defer tx.Rollback()

	// Insertion dans ASK_GROUP
	askId := uuid.New().String()
	notifId := uuid.New().String()

	query = `INSERT INTO ASK_GROUP(ID, ASKER, RECEIVER, GROUP_ID, ACCEPTED, CREATED_AT) 
	         VALUES (?, ?, ?, ?, 0, datetime('now'))`
	_, err = tx.Exec(query, askId, userID, owner, groupID)
	if err != nil {
		return errors.Wrap(err, "failed to insert into ASK_GROUP")
	}

	// Insertion dans NOTIFICATIONS
	query = `INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE) 
	         VALUES (?, ?, ?, ?)`
	_, err = tx.Exec(query, notifId, "ASK_GROUP", userID, askId)
	if err != nil {
		return errors.Wrap(err, "failed to insert into NOTIFICATIONS")
	}

	// Commit de la transaction
	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "transaction commit failed")
	}

	return nil
}
