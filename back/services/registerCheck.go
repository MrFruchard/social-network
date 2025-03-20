package services

import (
	"database/sql"
	"errors"
	"regexp"
	"sync"
)

func CheckRegister(db *sql.DB, email, nickname, password string) bool {
	response := make(map[string]chan bool)
	response["email"] = make(chan bool, 1)
	response["nickname"] = make(chan bool, 1)
	response["password"] = make(chan bool, 1)

	var wg sync.WaitGroup
	wg.Add(3) // On attend 4 goroutines

	// Vérification email
	go func() {
		defer wg.Done()
		response["email"] <- checkEmail(db, email)
	}()

	// Vérification nickname
	go func() {
		defer wg.Done()
		response["nickname"] <- checkNickname(db, nickname)
	}()

	// Vérification password
	go func() {
		defer wg.Done()
		response["password"] <- checkPassword(password)
	}()

	wg.Wait()

	// Lire les résultats
	emailOk := <-response["email"]
	nicknameOk := <-response["nickname"]
	passwordOk := <-response["password"]

	// Fermer les canaux
	close(response["email"])
	close(response["nickname"])
	close(response["password"])

	// Retourner true seulement si tout est valide
	return emailOk && nicknameOk && passwordOk
}

func checkPassword(password string) bool {
	// Vérifie la longueur
	if len(password) < 8 {
		return false
	}

	// Vérifie la présence d'une majuscule
	uppercase := regexp.MustCompile(`[A-Z]`)
	if !uppercase.MatchString(password) {
		return false
	}

	// Vérifie la présence d'une minuscule
	lowercase := regexp.MustCompile(`[a-z]`)
	if !lowercase.MatchString(password) {
		return false
	}

	// Vérifie la présence d'un chiffre
	number := regexp.MustCompile(`\d`)
	if !number.MatchString(password) {
		return false
	}

	// Vérifie la présence d'un caractère spécial
	specialChar := regexp.MustCompile(`[#!?@$%^&*\-]`)
	if !specialChar.MatchString(password) {
		return false
	}

	return true
}

func checkEmail(db *sql.DB, email string) bool {
	var isValid string

	regexEmail := regexp.MustCompile(`^[\w-.]+@[\w-]+\.[\w-]+$`)

	err := db.QueryRow("SELECT EMAIL FROM USER WHERE EMAIL = ?", email).Scan(&isValid)
	if errors.Is(err, sql.ErrNoRows) {
		return regexEmail.MatchString(email)
	}

	return false
}

func checkNickname(db *sql.DB, nickname string) bool {
	var isValid string

	err := db.QueryRow("SELECT USERNAME FROM USER WHERE USERNAME = ?", nickname).Scan(&isValid)
	if errors.Is(err, sql.ErrNoRows) {
		return true
	}

	return false
}
