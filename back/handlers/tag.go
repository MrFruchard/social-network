package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

func HandleSendPostWithTags(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if strings.TrimSpace(userID) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "user id is required")
		return
	}

	tag := r.URL.Query().Get("tag")
	if strings.TrimSpace(tag) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "tag is required")
		return
	}

	post, err := services.SendPostWithTags(db, userID, tag)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(post); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
	}
}
