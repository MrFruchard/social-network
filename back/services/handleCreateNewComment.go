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

	return nil
}
