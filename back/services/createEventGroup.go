package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
)

func CreateEventGroup(db *sql.DB, userId, groupId, eventDesc, optionA, optionB string) error {
	var exists bool
	err := db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?
		)
	`, userId, groupId).Scan(&exists)

	if err != nil {
		return err
	}
	if !exists {
		return errors.New("l'utilisateur n'est pas membre de ce groupe")
	}

	// Préparation des données
	id := uuid.New().String()

	// Insertion de l'événement
	_, err = db.Exec(`
		INSERT INTO GROUPS_EVENT (ID, GROUP_ID, SENDER, DESCRIPTION, OPTION_A, OPTION_B, CREATED_AT)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
	`, id, groupId, userId, eventDesc, optionA, optionB)

	return err
}
