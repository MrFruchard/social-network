package services

import (
	"database/sql"
	"errors"
	"fmt"
)

func UpdateComment(db *sql.DB, commentId, content, userId, img string) error {
	var ownerId string
	err := db.QueryRow("SELECT USER_ID FROM Comment WHERE ID = ?", commentId).Scan(&ownerId)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("commentaire non trouvé")
		}
		return fmt.Errorf("erreur lors de la récupération du commentaire : %v", err)
	}

	if ownerId != userId {
		return errors.New("vous n'êtes pas autorisé à modifier ce commentaire")
	}

	// Protection : on interdit la mise à jour si le contenu et l’image sont vides
	if content == "" && img == "" {
		return errors.New("le commentaire ne peut pas être vide et sans image")
	}

	if img != "" {
		_, err = db.Exec(`UPDATE Comment SET Content = ?, Image = ?, UPDATED_AT = datetime('now') WHERE ID = ?`, content, img, commentId)
	} else {
		_, err = db.Exec(`UPDATE Comment SET Content = ?, UPDATED_AT = datetime('now') WHERE ID = ?`, content, commentId)
	}
	if err != nil {
		return fmt.Errorf("erreur lors de la mise à jour du commentaire : %v", err)
	}

	return nil
}
