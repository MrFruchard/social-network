package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func DeletePrivateMemberPost(db *sql.DB, requesterID, targetUserID, postID string) error {
	var owner string
	query := `SELECT USER_ID FROM POSTS WHERE ID = ? LIMIT 1`
	err := db.QueryRow(query, postID).Scan(&owner)
	if err == sql.ErrNoRows {
		return errors.New("post not found")
	} else if err != nil {
		return errors.Wrap(err, "error querying post owner")
	}

	if owner != requesterID {
		return errors.New("you are not the owner of this post")
	}

	query = `DELETE FROM LIST_PRIVATE_POST WHERE POST_ID = ? AND USER_ID = ?`
	_, err = db.Exec(query, postID, targetUserID)
	if err != nil {
		return errors.Wrap(err, "failed to remove private post access")
	}

	return nil
}
