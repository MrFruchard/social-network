package utils

import (
	"crypto/rand"
	"encoding/base64"
	"log"
)

func GenerateToken(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		log.Println("Failed to generate random number")
	}
	return base64.URLEncoding.EncodeToString(bytes)
}
