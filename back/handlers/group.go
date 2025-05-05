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
	groupId := r.URL.Query().Get("groupId")
	if strings.TrimSpace(groupId) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupId")
		return
	}

	err := services.AcceptGroupInvite(db, userId, groupId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Group joined")
}

func HandleDeclineGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	groupId := r.URL.Query().Get("groupId")
	if strings.TrimSpace(groupId) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing groupId")
	}

	err := services.DeclineGroupInvite(db, userId, groupId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Group decline")
}

func HandleCreateEvent(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	event := r.URL.Query().Get("event")
	optionA := r.URL.Query().Get("optionA")
	optionB := r.URL.Query().Get("optionB")
	groupId := r.URL.Query().Get("groupId")
	if strings.TrimSpace(event) == "" || strings.TrimSpace(optionA) == "" || strings.TrimSpace(optionB) == "" || strings.TrimSpace(groupId) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing values")
		return
	}

	err := services.CreateEventGroup(db, userId, groupId, event, optionA, optionB)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Event Created")
}

func HandleResponseEvent(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	eventId := r.URL.Query().Get("eventId")
	groupId := r.URL.Query().Get("groupId")
	response := r.URL.Query().Get("response")
	if strings.TrimSpace(eventId) == "" || strings.TrimSpace(groupId) == "" || (response != "A" && response != "B") {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing values")
		return
	}

	err := services.ResponseEvent(db, userId, groupId, eventId, response)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Event Response")
}

func HandleGetGroupInfo(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
		return
	}
}
