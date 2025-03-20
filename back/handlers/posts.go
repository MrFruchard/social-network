package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network-back/services"
	"social-network-back/utils"
	"strings"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	content := r.FormValue("content")
	tag := r.FormValue("tags")
	if content == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing content or tag")
		return
	}
	var uuidAvatar string
	file, image, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		// Vérification de la taille du fichier
		const maxFileSize = 4 * 1024 * 1024
		if image.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}

		// Sauvegarde du fichier
		uuidAvatar, err = utils.SaveImage("Images/postImages/", file, image)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Invalid ")
			return
		}
	}

	groupId := r.FormValue("groupId")

	err = services.CreatePost(content, userID, uuidAvatar, tag, groupId, db)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Post created")
}

func HandleEventPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 || parts[2] == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing post ID")
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

	err = services.AddPostEvent(db, userID, commentId, event.Event)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Post not found")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Post event successfully")

}
