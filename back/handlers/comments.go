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

	postId, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	content := r.FormValue("content")

	err = services.CreateComment(userID, postId, content, db)
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

	commentId, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	var event Event
	err = json.NewDecoder(r.Body).Decode(&event)
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

func HandleDeleteComment(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	commentId, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid Post ID")
		return
	}

	err = services.DeleteComment(db, userID, commentId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Comment not found")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Comment successfully")
}

func HandleUpdateComment(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	commentId, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid comment ID")
		return
	}
	content := r.FormValue("content")
	if strings.TrimSpace(content) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Content is required")
		return
	}

	err = services.UpdateComment(db, commentId, content, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Comment not found")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Update comment successfully")
}
