package handlers

import (
	"database/sql"
	"net/http"
	"social-network/services"
	"social-network/utils"
	"strings"
)

func HandleCreateGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	title := r.FormValue("title")
	desc := r.FormValue("description")

	if strings.TrimSpace(title) == "" || strings.TrimSpace(desc) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing title, description")
		return
	}
	var uuidAvatar string
	file, avatar, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		// Vérification de la taille du fichier
		const maxFileSize = 4 * 1024 * 1024
		if avatar.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}

		// Sauvegarde du fichier
		uuidAvatar, err = utils.SaveImage("Images/groupImages/", file, avatar)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	err = services.CreateGroup(db, userId, title, desc, uuidAvatar)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Group created")

}

func HandleModifyGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	title := r.FormValue("title")
	desc := r.FormValue("description")
	groupId := r.FormValue("groupId")
	if strings.TrimSpace(groupId) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupId")
		return
	}
	var uuidAvatar string
	file, avatar, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		// Vérification de la taille du fichier
		const maxFileSize = 4 * 1024 * 1024
		if avatar.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}

		// Sauvegarde du fichier
		uuidAvatar, err = utils.SaveImage("Images/groupImages/", file, avatar)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	err = services.ModifyGroup(db, userId, title, desc, groupId, uuidAvatar)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Group updated")
}

func HandleDeleteGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupId := r.URL.Query().Get("groupId")

	err := services.DeleteGroup(db, userId, groupId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Group deleted")
}

func HandleInviteGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupId := r.URL.Query().Get("groupId")
	if strings.TrimSpace(groupId) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupId")
		return
	}

	receiver := r.URL.Query().Get("receiver")
	if strings.TrimSpace(receiver) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing receiver")
		return
	}

	err := services.SendInvitationGroup(db, userId, receiver, groupId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Invitation Send")
}

func HandleBanMemberGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userTobBan := r.URL.Query().Get("userId")
	groupId := r.URL.Query().Get("groupId")

	err := services.DeleteGroupMember(db, userId, userTobBan, groupId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Member banned")
}

func HandleAskToJoinGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupId := r.URL.Query().Get("groupId")

	err := services.AskToJoinGroup(db, groupId, userId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Asked to join group")
}

func HandleJoinGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
}
