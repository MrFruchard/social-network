package test

import (
	"regexp"
	"testing"
)

// Test de la fonction checkEmailFormat
func TestCheckEmailFormat(t *testing.T) {
	validEmails := []string{
		"user@example.com",
		"test.email@domain.com",
		"1234567890@example.net",
		"momo@momo.fr",
		"Mariela_Krajcik@yahoo.com",
	}

	invalidEmails := []string{
		"plainaddress",               // Pas de @
		"@missingusername.com",       // Pas de nom avant @
		"user@.com",                  // Domaine invalide
		"user@com",                   // Pas de point
		"user@domain..com",           // Double point
		"user@domain,com",            // Virgule au lieu du point
		"user@domain.com.",           // Point final invalide
		"username@.domain.com",       // Point avant le domaine
		"username@domain@domain.com", // Double @
	}

	for _, email := range validEmails {
		if !checkEmailFormat(email) {
			t.Errorf("Échec: %s devrait être valide", email)
		}
	}

	for _, email := range invalidEmails {
		if checkEmailFormat(email) {
			t.Errorf("Échec: %s ne devrait pas être valide", email)
		}
	}
}

func checkEmailFormat(email string) bool {
	regexEmail := regexp.MustCompile(`^[\w-.]+@[\w-]+\.[\w-]+$`)
	return regexEmail.MatchString(email)
}
