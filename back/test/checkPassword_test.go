package test

import (
	"regexp"
	"testing"
)

// Test de la fonction checkPassword
func TestCheckPassword(t *testing.T) {
	validPasswords := []string{
		"Strong1!", // Min 8 caractères, majuscule, minuscule, chiffre, caractère spécial
		"Passw0rd#",
		"Azerty12@",
		"KW%mE%1dwu@@@lLE",
	}

	invalidPasswords := []string{
		"short1!",       // Moins de 8 caractères
		"nocapital1!",   // Pas de majuscule
		"NOLOWERCASE1!", // Pas de minuscule
		"NoNumber!!",    // Pas de chiffre
		"OnlyLetters!",  // Pas de chiffre
	}

	for _, password := range validPasswords {
		if !checkPassword(password) {
			t.Errorf("Échec: %s devrait être valide", password)
		}
	}

	for _, password := range invalidPasswords {
		if checkPassword(password) {
			t.Errorf("Échec: %s ne devrait pas être valide", password)
		}
	}
}

// Vérification du mot de passe sans lookaheads
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
