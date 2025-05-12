package websocketFile

import (
	"database/sql"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"social-network/utils"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Hub) WsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true } // Gérer les origines autorisées
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur WebSocket:", err)
		return
	}
	defer conn.Close()

	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		log.Println("Erreur WebSocket: User id un cookie")
		return
	}

	h.mu.Lock()
	h.clients[conn] = userID
	h.mu.Unlock()
	log.Println("Connexion enregistrée avec userID:", userID)

	defer func() {
		h.mu.Lock()
		userID := h.clients[conn] // sauvegarde avant suppression
		h.mu.Unlock()

		log.Println("Déconnexion de userID:", userID)

		h.unregister <- conn
	}()

	for {
		msgType, p, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		log.Println("Message reçu:", string(p))
		log.Println("Message Type:", msgType)

		h.broadcast <- p // Diffusion du message à tous les clients
	}
}
