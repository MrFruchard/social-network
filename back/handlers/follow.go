package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

type UserId struct {
	Id string `json:"userid"`
}

func HandleAskFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var user UserId
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || strings.TrimSpace(user.Id) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	if user.Id == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err = services.AddRequestFollowHandler(db, userID, user.Id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Request Added")
}
