package websocketFile

import (
	"database/sql"
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"time"
)

func (h *Hub) SendGroupMessage(groupId, content, sender, convID, msgID string, isImage int, db *sql.DB) error {
	log.Println("=== Début de SendGroupMessage ===")
	log.Printf("Paramètres reçus - groupId: %s, sender: %s, convID: %s, msgID: %s, isImage: %d", groupId, sender, convID, msgID, isImage)

	var s SenderMessage

	// Récupération des membres du groupe
	queryGroupMember := `SELECT USER_ID FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	log.Println("Exécution de la requête pour récupérer les membres du groupe...")
	rows, err := db.Query(queryGroupMember, groupId)
	if err != nil {
		log.Printf("Erreur lors de la requête GROUPS_MEMBERS: %v", err)
		return err
	}
	defer rows.Close()

	var members []string
	for rows.Next() {
		var memberID string
		if err := rows.Scan(&memberID); err != nil {
			log.Printf("Erreur lecture membre : %v", err)
			continue
		}
		log.Printf("Membre trouvé : %s", memberID)
		members = append(members, memberID)
	}
	log.Printf("Total membres trouvés : %d", len(members))

	// Récupération des infos de l'expéditeur
	log.Println("Récupération des infos de l'expéditeur...")
	var pp, username sql.NullString
	query := `SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
	err = db.QueryRow(query, sender).Scan(&s.Sender.LastName, &s.Sender.FirstName, &username, &pp)
	if err != nil {
		log.Printf("Erreur récupération infos expéditeur : %v", err)
	}

	if pp.Valid {
		s.Sender.ProfilePic = pp.String
	}
	if username.Valid {
		s.Sender.Username = username.String
	}

	s.Sender.Id = sender
	s.Content = content
	s.ConvId = convID
	s.Type = "group_message"
	s.Time = time.Now()
	s.MessageId = msgID
	s.IsImage = isImage == 1

	log.Printf("Message structuré à envoyer : %+v", s)

	msgJSON, err := json.Marshal(s)
	if err != nil {
		log.Printf("Erreur lors du marshal JSON : %v", err)
		return err
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	log.Printf("Clients actifs (%d) : %v", len(h.clients), h.clients)

	for conn, userID := range h.clients {
		log.Printf("Vérification du client avec userID : %s", userID)
		for _, memberID := range members {
			log.Printf("Comparaison userID (%s) avec memberID (%s)", userID, memberID)
			if userID == memberID {
				log.Printf("Envoi du message à %s", memberID)
				err := conn.WriteMessage(websocket.TextMessage, msgJSON)
				if err != nil {
					log.Printf("❌ Erreur d'envoi à %s : %v", memberID, err)
				} else {
					log.Printf("✅ Message envoyé avec succès à %s", memberID)
				}
				break
			}
		}
	}

	log.Println("=== Fin de SendGroupMessage ===")
	return nil
}
