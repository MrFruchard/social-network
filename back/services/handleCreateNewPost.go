package services

import (
	"database/sql"
	"github.com/google/uuid"
)

func CreatePost(content, userId, image, tag, groupId string, db *sql.DB) error {
	id := uuid.New().String()

	var groudIdNull, imageNull, tagNull sql.NullString

	if groupId != "" {
		groudIdNull = sql.NullString{String: groupId, Valid: true}
	} else {
		groudIdNull = sql.NullString{Valid: false}
	}

	if image != "" {
		imageNull = sql.NullString{String: image, Valid: true}
	} else {
		imageNull = sql.NullString{Valid: false}
	}

	if tag != "" {
		tagNull = sql.NullString{String: tag, Valid: true}
	} else {
		tagNull = sql.NullString{Valid: false}
	}

	query := `INSERT INTO POSTS(ID, CONTENT, USER_ID, CREATED_AT, UPDATED_AT, IMAGE, TAG, GROUP_ID)
			  VALUES (?,? ,? ,datetime('now'), datetime('now'), ? ,? ,?)`

	_, err := db.Exec(query, id, content, userId, imageNull, tagNull, groudIdNull)
	if err != nil {
		return err
	}

	return nil
}
