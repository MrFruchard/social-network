package handlers

import (
	"database/sql"
	"net/http"
	"social-network/websocketFile"
)

func HandleSendMessage(w http.ResponseWriter, r *http.Request, db *sql.DB, h *websocketFile.Hub) {

}

func HandleGetMessage(w http.ResponseWriter, r *http.Request, db *sql.DB) {

}
