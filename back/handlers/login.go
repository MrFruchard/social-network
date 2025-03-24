package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"time"
)

type LoginCredentials struct {
	Credentials string `json:"credentials"`
	Password    string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var c LoginCredentials
	err := json.NewDecoder(r.Body).Decode(&c)

	if c.Credentials == "" || c.Password == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Empty credentials")
		return
	}

	match, userID := services.CheckCredential(db, c.Credentials, c.Password)
	if !match {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid credentials")
		return
	}

	sessionId := utils.GenerateToken(32)

	err = services.AddSessionToken(db, userID, sessionId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Error adding session token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionId,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false,                   // Obligatoire pour `SameSite=None`
		SameSite: http.SameSiteStrictMode, // Permet l'envoi cross-site
	})

	utils.SuccessResponse(w, http.StatusOK, "Successfully logged in")
}
