package utils

import (
	"database/sql"
	"net/http"
)

// GetUserIdByCookie récupère l'ID utilisateur depuis un cookie de session
func GetUserIdByCookie(r *http.Request, db *sql.DB) string {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return ""
	}
	value := cookie.Value

	var userID string
	query := "SELECT USER_ID FROM SESSION WHERE SESSION_ID = ?"
	err = db.QueryRow(query, value).Scan(&userID)
	if err != nil {
		return ""
	}

	return userID
}
