package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
	"log"
)

func AddPostEvent(db *sql.DB, userId, postID, event string) error {
	var existLike sql.NullString
	var postOwner string

	ownerQuery := `SELECT USER_ID FROM POSTS WHERE ID = ?`
	errOwner := db.QueryRow(ownerQuery, postID).Scan(&postOwner)
	if errOwner != nil {
		return errors.New("post not found")
	}

	query := `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
	err := db.QueryRow(query, postID, userId).Scan(&existLike)

	if errors.Is(err, sql.ErrNoRows) {
		// Aucun événement existant → INSERT
		id := uuid.New().String()
		insertQuery := `INSERT INTO POST_EVENT(ID, POST_ID, USER_ID, LIKED, CREATED_AT, UPDATE_AT) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
		_, err = db.Exec(insertQuery, id, postID, userId, event)
		if err != nil {
			log.Println(err)
			return err
		}

		if userId != postOwner {
			notifType, err := mapEventToNotificationType(event)
			if err != nil {
				log.Println(err)
				return err
			}

			err = AddNotification(db, notifType, id, postOwner)
			if err != nil {
				log.Println(err)
				return err
			}
		}
		return nil
	} else if err != nil {
		log.Println(err)
		return err
	}

	if (event == "liked" && existLike.Valid && existLike.String == "liked") ||
		(event == "disliked" && existLike.Valid && existLike.String == "disliked") {

		if userId != postOwner {
			// Récupérer l'ID du POST_EVENT pour supprimer la notification
			var notifID string
			query = `SELECT ID FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
			err = db.QueryRow(query, postID, userId).Scan(&notifID)
			if err != nil {
				log.Println(err)
				return err
			}

			delQuery := `DELETE FROM NOTIFICATIONS WHERE ID_TYPE = ? AND USER_ID = ?`
			_, err = db.Exec(delQuery, notifID, postOwner)
			if err != nil {
				log.Println(err)
				return err
			}
		}

		// Suppression de l'événement post (like/dislike)
		delEventQuery := `DELETE FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
		_, err = db.Exec(delEventQuery, postID, userId)
		if err != nil {
			log.Println(err)
			return err
		}

		return nil
	}

	// Mise à jour vers un autre type (like ↔ dislike)
	var notifID string
	query = `SELECT ID FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
	err = db.QueryRow(query, postID, userId).Scan(&notifID)
	if err != nil {
		log.Println(err)
		return err
	}

	// Mise à jour de l'event
	updateQuery := `UPDATE POST_EVENT SET LIKED = ?, UPDATE_AT = datetime('now') WHERE POST_ID = ? AND USER_ID = ?`
	_, err = db.Exec(updateQuery, event, postID, userId)
	if err != nil {
		log.Println(err)
		return err
	}

	// Mise à jour de la notification associée
	notifType, err := mapEventToNotificationType(event)
	if err != nil {
		log.Println(err)
		return err
	}

	updateNotifQuery := `UPDATE NOTIFICATIONS SET TYPE = ?, CREATED_AT = datetime('now') WHERE ID_TYPE = ? AND USER_ID = ?`
	_, err = db.Exec(updateNotifQuery, notifType, notifID, postOwner)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func mapEventToNotificationType(event string) (string, error) {
	switch event {
	case "liked":
		return "LIKE", nil
	case "disliked":
		return "DISLIKE", nil
	default:
		return "", errors.New("invalid event type for notification")
	}
}
