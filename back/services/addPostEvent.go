package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
	"log"
)

func AddPostEvent(db *sql.DB, userId, commentId, event string) error {
	var existLike sql.NullString

	query := `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
	err := db.QueryRow(query, commentId, userId).Scan(&existLike)
	if errors.Is(err, sql.ErrNoRows) {
		id := uuid.New().String()
		query1 := `INSERT INTO POST_EVENT(ID, POST_ID, USER_ID, LIKED, CREATED_AT, UPDATE_AT) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
		_, err = db.Exec(query1, id, commentId, userId, event)
		if err != nil {
			log.Println(err)
			return err
		}
		return nil
	}

	if (event == "liked" && existLike.Valid && existLike.String == "liked") ||
		(event == "disliked" && existLike.Valid && existLike.String == "disliked") {
		stmt, err := db.Prepare("UPDATE POST_EVENT SET LIKED = NULL, UPDATE_AT = datetime('now') WHERE POST_ID = ? AND USER_ID = ?")
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()
		_, err = stmt.Exec(commentId, userId)
		if err != nil {
			return err
		}
		return nil
	}

	stmt, err := db.Prepare("UPDATE POST_EVENT SET LIKED = ?, UPDATE_AT = datetime('now') WHERE POST_ID = ? AND USER_ID = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	_, err = stmt.Exec(event, commentId, userId)
	if err != nil {
		return err
	}

	return nil

}
