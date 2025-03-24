package handlers

import (
	"database/sql"
	"net/http"
	"social-network/utils"
)

func Logout(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, "No cookie found")
		return
	}

	cookieValue := cookie.Value

	query := `DELETE FROM SESSION WHERE SESSION_ID= ?`
	_, err = db.Exec(query, cookieValue)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,                   // Obligatoire pour `SameSite=None`
		SameSite: http.SameSiteStrictMode, // Permet l'envoi cross-site
	})

	utils.SuccessResponse(w, http.StatusOK, "Logout successful")
}
