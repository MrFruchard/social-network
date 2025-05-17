package websocketFile

import (
	"database/sql"
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type SenderMessage struct {
	Type    string    `json:"type"`
	Sender  UserInfo  `json:"sender"`
	Content string    `json:"content"`
	ConvId  string    `json:"convId"`
	Time    time.Time `json:"time"`
}

type UserInfo struct {
	Id         string `json:"id"`
	Username   string `json:"username"`
	LastName   string `json:"last_name"`
	FirstName  string `json:"first_name"`
	ProfilePic string `json:"profile_pic"`
}

func (h *Hub) SendPrivateMessage(members []string, content, sender, convID string, db *sql.DB) error {
	var s SenderMessage
	var pp, username sql.NullString
	query := `SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
	err := db.QueryRow(query, sender).Scan(&s.Sender.LastName, &s.Sender.FirstName, &username, &pp)
	if err != nil {
		log.Println(err)
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
	s.Type = "private_message"
	s.Time = time.Now()

	msgJSON, err := json.Marshal(s)
	if err != nil {
		return err
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	log.Printf("Clients actifs: %v", h.clients)
	log.Printf("Membres ciblés: %v", members)

	for conn, userID := range h.clients {
		for _, memberID := range members {
			if userID == memberID {
				err := conn.WriteMessage(websocket.TextMessage, msgJSON)
				if err != nil {
					log.Printf("Erreur envoi message privé à %s : %v", memberID, err)
				}
			}
		}
	}

	return nil
}
