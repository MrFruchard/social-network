package websocketFile

import (
	"database/sql"
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"time"
)

func (h *Hub) SendGroupMessage(groupId, content, sender, convID, msgID string, isImage int, db *sql.DB) error {
	// Récupération des membres du groupe
	queryGroupMember := `SELECT USER_ID FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	rows, err := db.Query(queryGroupMember, groupId)
	if err != nil {
		return err
	}
	defer rows.Close()

	var members []string
	for rows.Next() {
		var memberID string
		if err := rows.Scan(&memberID); err != nil {
			continue
		}
		members = append(members, memberID)
	}

	// Récupération des infos de l'expéditeur
	var s SenderMessage
	var pp, username sql.NullString
	query := `SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
	err = db.QueryRow(query, sender).Scan(&s.Sender.LastName, &s.Sender.FirstName, &username, &pp)
	if err != nil {
		return err
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
	s.GroupId = groupId // Ajouter le groupId

	msgJSON, err := json.Marshal(s)
	if err != nil {
		return err
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	// Envoyer le message à tous les membres connectés
	for conn, userID := range h.clients {
		for _, memberID := range members {
			if userID == memberID {
				err := conn.WriteMessage(websocket.TextMessage, msgJSON)
				if err != nil {
					log.Printf("Erreur envoi message groupe à %s : %v", memberID, err)
				}
				break
			}
		}
	}

	return nil
}