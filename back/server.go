package main

import (
	"database/sql"
	"log"
	"net/http"
	"social-network/middlewares"
	"social-network/pkg/db/sqlite"
	"social-network/router"
	"social-network/websocketFile"
	"time"
)

var middlewaresList = []interface{}{
	middlewares.CorsMiddleWare, // Ne nécessite pas la DB
}

// Application des middlewares
func applyMiddlewares(handler http.Handler, middlewares []interface{}, db *sql.DB) http.Handler {
	for _, m := range middlewares {
		switch mw := m.(type) {
		case func(http.Handler) http.Handler:
			handler = mw(handler)
		case func(http.Handler, *sql.DB) http.Handler:
			handler = mw(handler, db)
		default:
			log.Fatalf("Middleware avec type inconnu : %T", m)
		}
	}
	return handler
}

func main() {
	x
	// Applique les migrations
	sqlite.StartMigration()
	log.Println("Migrations terminées.")

	// Ouverture et Fermeture de la DB
	db, err := sqlite.OpenDB()
	if err != nil {
		log.Fatalf("Erreur lors de l'ouverture de la base de données : %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Fatalf("Erreur lors de la fermeture de la base de données : %v", err)
		}
	}()

	hub := websocketFile.NewHub(db)

	// Utilisation NewServeMux pour les handlers
	mux := http.NewServeMux()
	router.Handlers(mux, db, hub)

	// Application des middlewares (certains nécessitent la DB)
	midHandlers := applyMiddlewares(mux, middlewaresList, db)

	// Paramètre du serveur
	s := &http.Server{
		Addr:           ":3002",
		Handler:        midHandlers,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Lancement du serveur
	log.Println("🚀 Serveur démarré sur http://localhost:3002")
	log.Fatal(s.ListenAndServe())
}
