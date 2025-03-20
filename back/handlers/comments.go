package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

func HandleCreateComment(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 || parts[2] == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing Post ID")
		return
	}
	postId := parts[2]

	content := r.FormValue("content")

	err := services.CreateComment(userID, postId, content, db)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Post not found")
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Create comment successfully")
}

type Event struct {
	Event string `json:"event"`
}

func HandleEventComment(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 || parts[2] == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing comment ID")
		return
	}
	commentId := parts[2]

	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	if !(event.Event == "liked" || event.Event == "disliked") {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	err = services.AddCommentEvent(db, userID, commentId, event.Event)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Comment not found")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Comment event successfully")
}
