package middlewares

import (
	"database/sql"
	"log"
	"net/http"
	"social-network/services"
)

func AuthMiddleware(r *http.Request, db *sql.DB) (string, bool) {
	var userId string

	cookie, err := r.Cookie("session_id")
	if err != nil {
		log.Println(err)
		return "", false
	}
	cookieValue := cookie.Value

	userId, err = services.GetUserIdBySessionId(cookieValue, db)
	if err != nil {
		return "", false
	}

	return userId, true
}
