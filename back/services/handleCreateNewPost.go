package services

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

// Constantes pour la confidentialité
const (
	PrivacyPrivate = 0
	PrivacyFriends = 1
	PrivacyPublic  = 2
)

// Fonction utilitaire pour créer un sql.NullString
func toNullString(value string) sql.NullString {
	return sql.NullString{String: value, Valid: value != ""}
}

// Fonction principale pour créer un post
func CreatePost(content, userId, image, tag, groupId, privacy string, users []string, db *sql.DB) error {
	id := uuid.New().String()

	imageNull := toNullString(image)
	tagNull := toNullString(tag)
	groupIdNull := toNullString(groupId)

	privacyPost := PrivacyFriends
	if privacy == "public" {
		privacyPost = PrivacyPublic
	}
	if len(users) > 0 {
		privacyPost = PrivacyPrivate
		for _, user := range users {
			var isFollowing bool
			query := `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
			err := db.QueryRow(query, userId, user).Scan(&isFollowing)
			if err != nil {
				return err
			}
			if !isFollowing {
				return errors.New("Following users do not exist")
			}
		}
	}

	// On insère d'abord dans POSTS
	postQuery := `
		INSERT INTO POSTS(ID, CONTENT, USER_ID, CREATED_AT, UPDATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY)
		VALUES (?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?, ?)
	`
	_, err := db.Exec(postQuery, id, content, userId, imageNull, tagNull, groupIdNull, privacyPost)
	if err != nil {
		return err
	}

	// Ensuite, si c'est un post privé, on insère les utilisateurs autorisés
	if privacyPost == PrivacyPrivate {
		for _, user := range users {
			idPrivate := uuid.New().String()
			privateQuery := `
				INSERT INTO LIST_PRIVATE_POST(ID, POST_ID, USER_ID, CREATED_AT)
				VALUES (?, ?, ?, datetime('now'))
			`
			_, err = db.Exec(privateQuery, idPrivate, id, user)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
