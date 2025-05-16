package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"

	"google.golang.org/genai"
)

func HandleTotoAi(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userID := utils.GetUserIdByCookie(r, db)
	if userID == "" {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	message := r.FormValue("message")

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  "AIzaSyAJz5eB8OAjAYutS4TmncwYVQo0Kxq83cc",
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		http.Error(w, "Erreur lors de la création du client Gemini", http.StatusInternalServerError)
		return
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash",
		genai.Text(message),
		nil,
	)
	if err != nil {
		http.Error(w, "Erreur lors de la génération du contenu", http.StatusInternalServerError)
		return
	}

	// Structure de réponse
	response := map[string]string{
		"response": result.Text(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Println("Erreur encodage JSON:", err)
	}
}
