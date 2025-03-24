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
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Request Added")
}

func HandleFollowAgreement(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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

	err = services.AcceptFollow(db, userID, user.Id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Follow Agreement")
}

func HandleUnfollowAgreement(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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

	err = services.Unfollow(db, userID, user.Id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Unfollow Agreement")
}

func HandleDeclineFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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

	err = services.DeclineFollow(db, userID, user.Id)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Decline Follow")

}

type FollowerResponse struct {
	Status    string                     `json:"status"`
	Followers []services.ListOfFollowers `json:"followers"`
}

func HandleListFollowers(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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

	var self bool
	if user.Id == userID {
		self = true
	} else {
		userID = user.Id
		self = false
	}

	var followers []services.ListOfFollowers

	followers, err = services.SendListFollower(db, user.Id, userID, self)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	response := FollowerResponse{
		Status:    "success",
		Followers: followers,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}
}

type FollowResponse struct {
	Status    string                     `json:"status"`
	Followers []services.ListOfFollowers `json:"followers"`
}

func HandleFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
}
