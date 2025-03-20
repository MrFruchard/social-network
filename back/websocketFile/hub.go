package websocketFile

import (
	"database/sql"
	"github.com/gorilla/websocket"
	"log"
	"sync"
)

type Hub struct {
	clients    map[*websocket.Conn]string // Stocke les connexions WebSocket actives
	broadcast  chan interface{}           // Canal pour diffuser les messages à tous les clients
	register   chan *websocket.Conn       // Canal pour enregistrer une connexion
	unregister chan *websocket.Conn       // Canal pour supprimer une connexion
	mu         sync.Mutex                 // Mutex pour éviter les conflits d'accès
	DB         *sql.DB                    // Connexion à la base de données pour vérifier la session
}

// NewHub crée un nouveau hub WebSocket.
func NewHub(db *sql.DB) *Hub {
	hub := &Hub{
		clients:    make(map[*websocket.Conn]string),
		broadcast:  make(chan interface{}),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		DB:         db,
	}

	go hub.run()

	return hub
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mu.Lock()
			h.clients[conn] = ""
			log.Println("client:", h.clients[conn])
			h.mu.Unlock()
		case conn := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
				log.Println("Disconnected from client")
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.Lock()
			for conn := range h.clients {
				if err := conn.WriteJSON(message); err != nil {
					log.Println(err)
					conn.Close()
					delete(h.clients, conn)
				}
			}
			h.mu.Unlock()
		}
	}
}
