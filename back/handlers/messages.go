package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"social-network/websocketFile"
	"strings"
)

func HandleSendMessage(w http.ResponseWriter, r *http.Request, db *sql.DB, h *websocketFile.Hub) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	receivers := r.Form["receiver"]
	fmt.Println(receivers)
	content := strings.TrimSpace(r.FormValue("content"))
	conversationID := strings.TrimSpace(r.FormValue("conversationId"))

	if len(receivers) == 0 {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing receiver field")
		return
	}

	file, image, err := r.FormFile("image")
	hasImage := err == nil
	hasText := content != ""
	if hasImage && hasText {
		utils.ErrorResponse(w, http.StatusBadRequest, "Only one of 'content' or 'image' is allowed")
		return
	}

	var typeMessage int
	if hasImage {
		defer file.Close()
		const maxFileSize = 4 * 1024 * 1024
		if image.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}
		content, err = utils.SaveImage("Images/messages/", file, image)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to save image")
			return
		}
		typeMessage = 1
	} else if hasText {
		typeMessage = 0
	} else {
		utils.ErrorResponse(w, http.StatusBadRequest, "You must provide either an image or text content")
		return
	}

	members := append(receivers, userID)

	_, err = services.AddMessage(db, members, userID, conversationID, content, typeMessage)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create group conversation")
		return
	}

	// Broadcast aux membres

	utils.SuccessResponse(w, http.StatusOK, "Message sent to group")
}

// Send all Conversation
func HandleGetConversation(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized: user ID not found")
		return
	}

	conversations, err := services.GetConversation(db, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to retrieve conversations")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(conversations); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to encode JSON")
	}
}

// Send all Messages
func HandleGetMessages(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized: user ID not found")
		return
	}

	convID := r.URL.Query().Get("convID")

	messages, err := services.GetMessages(db, userID, convID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to retrieve messages")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(messages); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to encode JSON")
	}
}

// send Message to group
func HandleMessageGroups(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	content := strings.TrimSpace(r.FormValue("content"))
	groupID := strings.TrimSpace(r.FormValue("groupID"))
	if groupID == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupID field")
		return
	}

	file, image, err := r.FormFile("image")
	hasImage := err == nil
	hasText := content != ""

	if hasImage && hasText {
		utils.ErrorResponse(w, http.StatusBadRequest, "Only one of 'content' or 'image' is allowed")
		return
	}

	var typeMessage int
	if hasImage {
		defer file.Close()
		const maxFileSize = 4 * 1024 * 1024
		if image.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}
		imagePath, err := utils.SaveImage("Images/groupMessages/", file, image)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to save image")
			return
		}
		content = imagePath
		typeMessage = 1
	} else if hasText {
		typeMessage = 0
	} else {
		utils.ErrorResponse(w, http.StatusBadRequest, "You must provide either an image or text content")
		return
	}

	err = services.SendGroupMessage(db, userID, groupID, content, typeMessage)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to send group message")
		return
	}

	// TODO: broadcast message to group

	utils.SuccessResponse(w, http.StatusOK, "Message sent to group")
}

// Get message group
func HandleGetMessageGroups(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized: user ID not found")
		return
	}
	groupID := strings.TrimSpace(r.URL.Query().Get("groupID"))
	if groupID == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupID field")
		return
	}

	listMessage, err := services.SendMessageGroup(db, userID, groupID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to send group message")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(listMessage); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to encode JSON")
	}
}
