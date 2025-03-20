package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"social-network-back/services"
	"social-network-back/utils"
)

func Register(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	email := r.FormValue("email")
	password := r.FormValue("password")
	firstName := r.FormValue("first_name")
	lastName := r.FormValue("last_name")
	dateOfBirth := r.FormValue("date_of_birth")
	nickname := r.FormValue("username")
	about := r.FormValue("about_me")

	if email == "" || password == "" || firstName == "" || lastName == "" || dateOfBirth == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Empty fields")
		return
	}

	verify := services.CheckRegister(db, email, nickname, password)
	if !verify {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid credential")
		return
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Gestion de l'avatar
	var uuidAvatar string
	file, avatar, err := r.FormFile("avatar")
	if err == nil {
		defer file.Close()

		// Vérification de la taille du fichier
		const maxFileSize = 4 * 1024 * 1024
		if avatar.Size > maxFileSize {
			utils.ErrorResponse(w, http.StatusBadRequest, "File too large (max 4MB)")
			return
		}

		// Sauvegarde du fichier
		uuidAvatar, err = utils.SaveImage("Images/avatars/", file, avatar)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Invalid ")
			return
		}
	}

	utils.SuccessResponse(w, http.StatusOK, "User register")

	go func() {
		err := services.RegisterUser(db, email, hashedPassword, firstName, lastName, dateOfBirth, nickname, uuidAvatar, about)
		if err != nil {
			log.Printf("Failed to register user: %v", err)
		} else {
			log.Printf("User registered successfully :  %v", email)
		}
	}()
}
