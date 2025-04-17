package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

func HandleAskFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user := r.URL.Query().Get("user")

	if user == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err := services.AddRequestFollowHandler(db, userID, user)
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
	user := r.URL.Query().Get("user")

	if user == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err := services.AcceptFollow(db, userID, user)
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
	user := r.URL.Query().Get("user")
	if user == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err := services.Unfollow(db, userID, user)
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
	user := r.URL.Query().Get("user")
	if user == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err := services.DeclineFollow(db, userID, user)
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
	var user string
	user = r.URL.Query().Get("user")
	if strings.TrimSpace(user) == "" {
		log.Println("user is empty")
		user = userID
	}

	var followers []services.ListOfFollowers

	followers, err := services.SendListFollower(db, user, userID)
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
	Status    string                  `json:"status"`
	Followers []services.ListOfFollow `json:"follow"`
}

func HandleFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	targetUserID := r.URL.Query().Get("user")
	if strings.TrimSpace(targetUserID) == "" {
		log.Println("targetUserID is empty, defaulting to requester")
		targetUserID = userID
	}

	var follow []services.ListOfFollow
	follow, err := services.SendListFollow(db, targetUserID, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	response := FollowResponse{
		Status:    "success",
		Followers: follow,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}
}

func HandleDeleteFollow(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	user := r.URL.Query().Get("user")
	if user == userID {
		utils.ErrorResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	err := services.DeleteFollower(db, userID, user)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Unfollow Agreement")
}
