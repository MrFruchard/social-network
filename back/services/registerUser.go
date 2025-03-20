package services

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/google/uuid"
)

func RegisterUser(db *sql.DB, email, hashedPassword, firstName, lastName, dateOfBirth, nickname, uuidAvatar, about string) error {
	// Générer un ID unique pour l'utilisateur
	id := uuid.New().String()

	// Gérer les valeurs NULL pour IMAGE, USERNAME et ABOUT_ME
	var imageNull, usernameNull, aboutMeNull sql.NullString

	if uuidAvatar != "" {
		imageNull = sql.NullString{String: uuidAvatar, Valid: true}
	} else {
		imageNull = sql.NullString{Valid: false} // Insère NULL
	}

	if nickname != "" {
		usernameNull = sql.NullString{String: nickname, Valid: true}
	} else {
		usernameNull = sql.NullString{Valid: false} // Insère NULL
	}

	if about != "" {
		aboutMeNull = sql.NullString{String: about, Valid: true}
	} else {
		aboutMeNull = sql.NullString{Valid: false} // Insère NULL
	}

	query := `
	INSERT INTO USER (ID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME, DATE_OF_BIRTH, IMAGE, USERNAME, ABOUT_ME, PUBLIC, CREATED_AT) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`

	// Exécuter l'insertion avec les valeurs NULL gérées
	_, err := db.Exec(query, id, email, hashedPassword, firstName, lastName, dateOfBirth, imageNull, usernameNull, aboutMeNull)
	if err != nil {
		log.Printf("Erreur lors de l'insertion de l'utilisateur : %v", err)
		return fmt.Errorf("failed to insert user: %w", err)
	}

	return nil
}
