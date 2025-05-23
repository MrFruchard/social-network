package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
)

func HandleGetNotifications(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	notifications, err := services.SendNotifications(db, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Toujours envoyer un tableau JSON, même s'il est vide
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(notifications)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func HandleReadNotifications(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	notifId := r.URL.Query().Get("id")
	if notifId == "" {
		utils.ErrorResponse(w, http.StatusNotFound, "Not Found")
		return
	}

	err := services.ReadNotifications(db, userID, notifId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Notifications Read")
}
