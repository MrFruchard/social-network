package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

func HandleSearchBar(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if strings.TrimSpace(userID) == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	param := r.URL.Query().Get("search")
	if strings.TrimSpace(param) == "" || len(param) < 2 {
		utils.ErrorResponse(w, http.StatusBadRequest, "search parameter must be at least 3 characters")
		return
	}

	result, err := services.SendSearch(db, param)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(result); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
}
