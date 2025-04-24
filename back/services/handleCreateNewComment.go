package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
)

func CreateComment(userId, postId, content, img string, db *sql.DB) error {
	// Vérifie que le commentaire contient soit du texte, soit une image
	if content == "" && img == "" {
		return errors.New("le commentaire doit contenir du texte ou une image")
	}

	// Vérifie que le post existe
	var existingPostID bool
	query1 := `SELECT EXISTS(SELECT 1 FROM POSTS WHERE ID = ?)`
	err := db.QueryRow(query1, postId).Scan(&existingPostID)
	if err != nil {
		return err
	}
	if !existingPostID {
		return errors.New("post non trouvé")
	}

	var ownerId string
	ownerQuery := `SELECT USER_ID FROM POSTS WHERE ID = ?`
	err = db.QueryRow(ownerQuery, postId).Scan(&ownerId)
	if err != nil {
		return err
	}

	// Prépare l'image comme une valeur nullable
	postImg := sql.NullString{
		String: img,
		Valid:  img != "",
	}

	id := uuid.New().String()

	query := `INSERT INTO COMMENT (ID, POST_ID, USER_ID, CONTENT, IMAGE, CREATED, UPDATED_AT)
	          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`

	_, err = db.Exec(query, id, postId, userId, content, postImg)
	if err != nil {
		return err
	}

	if ownerId != userId {
		idNotif := uuid.New().String()
		notifQuery := `INSERT INTO NOTIFICATIONS(ID, TYPE, USER_ID, ID_TYPE, READ, CREATED_AT) VALUES (?,?,?,?,0, datetime('now'))`
		_, err = db.Exec(notifQuery, idNotif, ownerId, "COMMENT", id)
		if err != nil {
			return err
		}
	}

	return nil
}
