package handlers

import (
	"database/sql"
	"net/http"
	"social-network/utils"
)

func HandleCheckEmail(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	email := r.URL.Query().Get("email")
	if email == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "email required")
		return
	}

	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM USER WHERE EMAIL  = ?)`
	err := db.QueryRow(query, email).Scan(&exists)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return
	}

	if exists {
		utils.ErrorResponse(w, http.StatusConflict, "Email is already taken")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Username is available")

}

func HandleCheckUsername(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Username is required")
		return
	}

	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM USER WHERE USERNAME = ?)`
	err := db.QueryRow(query, username).Scan(&exists)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Database error: "+err.Error())
		return
	}

	if exists {
		utils.ErrorResponse(w, http.StatusConflict, "Username is already taken")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Username is available")

}
