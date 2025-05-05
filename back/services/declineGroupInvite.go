package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func DeclineGroupInvite(db *sql.DB, userID, groupId string) error {
	var isMember, isInvited bool

	// Vérifie si l'utilisateur est déjà membre du groupe
	queryMember := `SELECT EXISTS (SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND ID = ?)`
	err := db.QueryRow(queryMember, userID, groupId).Scan(&isMember)
	if err != nil {
		return errors.Wrap(err, "failed to check group membership")
	}
	if isMember {
		return errors.New("user is already a member of this group")
	}

	// Vérifie si l'invitation existe
	queryInvite := `SELECT EXISTS (SELECT 1 FROM ASK_GROUP WHERE RECEIVER = ? AND GROUP_ID = ?)`
	err = db.QueryRow(queryInvite, userID, groupId).Scan(&isInvited)
	if err != nil {
		return errors.Wrap(err, "failed to check invitation")
	}
	if !isInvited {
		return errors.New("no invitation found for this group")
	}

	// Supprime l'invitation
	deleteQuery := `DELETE FROM ASK_GROUP WHERE RECEIVER = ? AND GROUP_ID = ?`
	_, err = db.Exec(deleteQuery, userID, groupId)
	if err != nil {
		return errors.Wrap(err, "failed to delete group invitation")
	}

	return nil
}
