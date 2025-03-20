package websocketFile

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Hub) WsHandler(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true } // Gérer les origines autorisées
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur WebSocket:", err)
		return
	}
	defer conn.Close()

	h.register <- conn // Enregistre la connexion

	defer func() {
		h.unregister <- conn // Désenregistre la connexion
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
