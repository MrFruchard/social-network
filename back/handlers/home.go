package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"social-network/services"
	"social-network/utils"
)

func HandleHomePost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	list, err := services.SendHomePost(db, userId)
	if err != nil {
		log.Println(err)
		return
	}

	data := ResponseStruct{
		Message: "success",
		Data:    list,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}

}

type ResponseGroup struct {
	Message   string               `json:"message"`
	Data      []services.GroupHome `json:"data"`
	Discovery []services.GroupHome `json:"discovery"`
}

func HandleHomeGroup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userId := utils.GetUserIdByCookie(r, db)
	if userId == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	list, discovery, err := services.SendGroupHome(db, userId)
	if err != nil {
		log.Println(err)
		return
	}

	res := ResponseGroup{
		Message:   "success",
		Data:      list,
		Discovery: discovery,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(res); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Erreur d'encodage JSON")
	}
}
