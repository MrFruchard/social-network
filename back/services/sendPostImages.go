package services

import (
	"database/sql"
	"github.com/pkg/errors"
	"log"
)

func CanPassPostImage(db *sql.DB, userID, imgID string) error {
	var privacy int
	var userPostId string
	var postId string

	log.Println(imgID)

	query := `SELECT ID FROM POSTS WHERE IMAGE = ? LIMIT 1`
	err := db.QueryRow(query, imgID).Scan(&postId)
	if err != nil {
		return errors.Wrap(err, "CanPassPostImage")
	}

	query = `SELECT PRIVACY, USER_ID FROM POSTS WHERE ID = ? LIMIT 1`
	err = db.QueryRow(query, postId).Scan(&privacy, &userPostId)
	if err != nil {
		return err
	}

	if userID == userPostId {
		return nil
	}

	if privacy == 2 {
		return nil
	} else if privacy == 1 {
		var follower bool
		query = `SELECT EXISTS (SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
		err = db.QueryRow(query, userPostId, userID).Scan(&follower)
		if err != nil {
			return err
		}
		if !follower {
			return errors.New("User does not have the following post")
		}
	} else if privacy == 0 {
		var private bool
		query = `SELECT EXISTS (SELECT 1 FROM LIST_PRIVATE_POST WHERE POST_ID = ? AND USER_ID = ?)`
		err = db.QueryRow(query, postId, userID).Scan(&private)
		if err != nil {
			return err
		}
		if !private {
			return errors.New("User does not have the following post")
		}
	}

	return nil
}
