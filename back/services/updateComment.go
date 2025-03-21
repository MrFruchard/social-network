package services

import (
	"database/sql"
	"errors"
	"fmt"
)

func UpdateComment(db *sql.DB, commentId, content, userId string) error {
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

	_, err = db.Exec("UPDATE Comment SET Content = ? WHERE Id = ?", content, commentId)
	if err != nil {
		return fmt.Errorf("erreur lors de la mise à jour du commentaire : %v", err)
	}

	return nil
}
