package services

import (
	"database/sql"
	"fmt"
	"log"
	"social-network-back/utils"
)

func CheckCredential(db *sql.DB, credentials, password string) (bool, string) {
	var userID, hashedPassword string

	query := `SELECT ID , PASSWORD FROM USER WHERE EMAIL = ? OR  USERNAME = ?`
	err := db.QueryRow(query, credentials, credentials).Scan(&userID, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("Utilisateur non trouvé.")
		} else {
			log.Println("Erreur lors de la requête SQL:", err)
		}
		return false, ""
	}

	match, err := utils.UnHashPassword(password, hashedPassword)
	if err != nil {
		log.Println("Erreur lors de la password hash:", err)
		return false, ""
	}

	return match, userID
}
