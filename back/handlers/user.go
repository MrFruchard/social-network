package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
)

func HandleUserPersonal(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var userInfos services.UserInfoResponse

	userInfos, err := services.GetUserInfos(db, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(userInfos); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}

}

func HandleUserInfos(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	target, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	var userInfos services.UserInfoResponseFromTarget

	userInfos, err = services.GetUserInfoFromTarget(db, target, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(userInfos); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}
}

func HandleSwitchPublicStatus(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err := services.TogglePublicStatus(db, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Status changed")

}
