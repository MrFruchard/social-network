package services

import (
	"database/sql"
	"log"
)

func AddSessionToken(db *sql.DB, userID, sessionID string) error {
	var existingUserID string
	queryCheck := `SELECT USER_ID FROM SESSION WHERE USER_ID = ?`
	err := db.QueryRow(queryCheck, userID).Scan(&existingUserID)

	if err != nil && err != sql.ErrNoRows {
		log.Printf("Erreur lors de la vérification de la session : %v", err)
		return err
	}

	// Si une session existe, on la supprime
	if err == nil {
		queryDelete := `DELETE FROM SESSION WHERE USER_ID = ?`
		_, err = db.Exec(queryDelete, userID)
		if err != nil {
			log.Printf("Erreur lors de la suppression de la session : %v", err)
			return err
		}
		log.Println("Ancienne session supprimée avec succès.")
	}

	// Insère une nouvelle session
	queryInsert := `INSERT INTO SESSION (SESSION_ID, USER_ID, CREATED_AT, EXPIRE_AT) VALUES (?, ?, datetime('now'), datetime('now', '+24 hours'))`
	_, err = db.Exec(queryInsert, sessionID, userID)
	if err != nil {
		log.Printf("Erreur lors de l'insertion de la session : %v", err)
		return err
	}

	log.Println("Nouvelle session créée avec succès.")
	return nil
}
