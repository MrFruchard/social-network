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

func CreatePostHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	content := r.FormValue("content")
	tag := r.FormValue("tags")
	if strings.TrimSpace(content) == "" {
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

	postId, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
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

	err = services.AddPostEvent(db, userID, postId, event.Event)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Post not found")
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Post event successfully")

}

func HandleDeletePost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	postID, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	err = services.DeletePost(db, postID, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Post not found")
		log.Println(err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Post deleted")
}

func HandleUpdatePost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	postID, err := utils.ParseUrl(r)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	content := r.FormValue("content")
	tags := r.FormValue("tags")
	if strings.TrimSpace(content) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing content or tags")
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

	err = services.UpdatePost(db, userID, postID, content, tags, uuidAvatar)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Post not found")
		log.Println(err)
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Post updated")
}

func HandleGetPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID := r.URL.Query().Get("postId")
	if postID == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing postId")
		return
	}

	postInfo, err := services.GetOnePostInfo(db, userID, postID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(postInfo); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to encode JSON")
	}
}
