package services

import (
	"database/sql"
	"github.com/google/uuid"
	"log"
	"time"
)

func SendEventGroupNotif(eventID, groupID, senderUserID string, db *sql.DB) {
	// On récupère les membres du groupe
	queryMembers := `SELECT USER_ID FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	rows, err := db.Query(queryMembers, groupID)
	if err != nil {
		log.Println("Error querying group members:", err)
		return
	}
	defer rows.Close()

	// On démarre une transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Println("Recovered from panic in SendEventGroupNotif:", p)
		} else {
			err = tx.Commit()
			if err != nil {
				log.Println("Error committing transaction:", err)
			}
		}
	}()

	for rows.Next() {
		var userID string
		err = rows.Scan(&userID)
		if err != nil {
			log.Println("Error scanning user ID:", err)
			continue
		}

		// On ne notifie pas l'utilisateur qui a déclenché l'event
		if userID == senderUserID {
			continue
		}

		// On génère une notif EVENT_GROUP
		idNotif := uuid.New().String()
		insertNotifQuery := `
			INSERT INTO NOTIFICATIONS (ID, TYPE, USER_ID, ID_TYPE) 
			VALUES (?, 'EVENT_GROUP', ?, ?)
		`

		for i := 0; i < 3; i++ { // on ajoute un petit retry sur database is locked
			_, err = tx.Exec(insertNotifQuery, idNotif, userID, eventID)
			if err == nil {
				break
			}
			if err != nil && err.Error() == "database is locked" {
				log.Println("Database is locked, retrying insert...")
				time.Sleep(50 * time.Millisecond)
				continue
			}
			if err != nil {
				log.Println("Error inserting notification for user", userID, ":", err)
				break
			}
		}
	}

	// Vérification d'erreur sur rows
	if err = rows.Err(); err != nil {
		log.Println("Error iterating over rows:", err)
	}
}
