package middlewares

import (
	"database/sql"
	"net/http"
)

func CorsMiddleWare(next http.Handler, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigin := "http://localhost" // À rendre configurable en production

		// Autoriser le CORS
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Gérer les requêtes preflight (OPTIONS)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Vérifier si Content-Type est déjà défini, sinon ajouter application/json
		contentType := r.Header.Get("Content-Type")
		if w.Header().Get("Content-Type") == "" {
			if contentType == "multipart/form-data" {
				w.Header().Set("Content-Type", "multipart/form-data")
			} else {
				w.Header().Set("Content-Type", "application/json")
			}
		}

		// Appliquer le rate limiting
		rateLimitedHandler := RateLimitMiddleware(next, db)
		rateLimitedHandler.ServeHTTP(w, r)
	})
}
