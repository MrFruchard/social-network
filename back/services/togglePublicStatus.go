package services

import (
	"database/sql"
	"fmt"
)

func TogglePublicStatus(db *sql.DB, userID string) error {
	// Récupérer le statut actuel (0 ou 1)
	var currentStatus int
	err := db.QueryRow("SELECT PUBLIC FROM USER WHERE ID = ?", userID).Scan(&currentStatus)
	if err != nil {
		return fmt.Errorf("erreur lors de la récupération du statut actuel : %v", err)
	}

	// Inverser le statut
	newStatus := 1
	if currentStatus == 1 {
		newStatus = 0
	}

	// Mettre à jour le champ PUBLIC
	_, err = db.Exec("UPDATE USER SET PUBLIC = ? WHERE ID = ?", newStatus, userID)
	if err != nil {
		return fmt.Errorf("erreur lors de la mise à jour du statut : %v", err)
	}

	return nil
}
