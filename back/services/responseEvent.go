package services

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
	"strings"
)

func ResponseEvent(db *sql.DB, userId, groupID, eventId, response string) error {
	response = strings.ToUpper(response)

	var responseInt int
	if response == "A" {
		responseInt = 1
	} else if response == "B" {
		responseInt = 2
	} else {
		return errors.New("invalid response")
	}

	// Vérifier si une réponse existe déjà
	var existingID string
	var existingResponse int
	err := db.QueryRow(`
		SELECT ID, RESPONSE FROM RESPONSE_EVENT 
		WHERE USER_ID = ? AND EVENT_ID = ? AND GROUP_ID = ?
	`, userId, eventId, groupID).Scan(&existingID, &existingResponse)

	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if existingID != "" {
		if existingResponse == responseInt {
			// ✅ Même réponse → toggle (supprime la réponse)
			_, err = db.Exec(`DELETE FROM RESPONSE_EVENT WHERE ID = ?`, existingID)
			return err
		} else {
			// ✅ Réponse différente → mise à jour
			_, err = db.Exec(`UPDATE RESPONSE_EVENT SET RESPONSE = ? WHERE ID = ?`, responseInt, existingID)
			return err
		}
	}

	// ✅ Aucune réponse encore → insertion
	id := uuid.New().String()
	_, err = db.Exec(`
		INSERT INTO RESPONSE_EVENT (ID, USER_ID, RESPONSE, EVENT_ID, GROUP_ID)
		VALUES (?, ?, ?, ?, ?)
	`, id, userId, responseInt, eventId, groupID)

	return err
}
