package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AcceptAskerToJoinGroup(db *sql.DB, groupId, ownerId, askerId string) error {
	// Vérifier si l'utilisateur est bien le propriétaire du groupe
	var isOwner bool
	query := `SELECT EXISTS (SELECT 1 FROM ALL_GROUPS WHERE ID = ? AND OWNER = ?)`
	err := db.QueryRow(query, groupId, ownerId).Scan(&isOwner)
	if err != nil {
		return errors.Wrap(err, "failed to verify group ownership")
	}
	if !isOwner {
		return errors.New("you are not the owner of this group")
	}

	// Vérifier si l'utilisateur a fait une demande non encore acceptée
	var isOnAsk bool
	query = `SELECT EXISTS(SELECT 1 FROM ASK_GROUP WHERE GROUP_ID = ? AND ASKER = ? AND ACCEPTED = 0)`
	err = db.QueryRow(query, groupId, askerId).Scan(&isOnAsk)
	if err != nil {
		return errors.Wrap(err, "failed to check ask request")
	}
	if !isOnAsk {
		return errors.New("this user has not requested to join the group or has already been accepted")
	}

	// Mise à jour de la demande pour l'accepter
	query = `UPDATE ASK_GROUP SET ACCEPTED = 1 WHERE GROUP_ID = ? AND ASKER = ? AND ACCEPTED = 0`
	result, err := db.Exec(query, groupId, askerId)
	if err != nil {
		return errors.Wrap(err, "failed to accept the request")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get rows affected")
	}
	if rowsAffected == 0 {
		return errors.New("no request updated, possibly already accepted or doesn't exist")
	}

	id := uuid.New().String()
	query = `INSERT INTO GROUPS_MEMBERS (ID, USER_ID, GROUP_ID, CREATED_AT) VALUES (?, ?, ?, datetime('now'))`
	_, err = db.Exec(query, id, askerId, groupId)
	if err != nil {
		return errors.Wrap(err, "failed to accept the request")
	}

	return nil
}
