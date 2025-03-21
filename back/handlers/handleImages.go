package handlers

import (
	"database/sql"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// Liste des extensions autorisées
var allowedExtensions = map[string]bool{
	".png":  true,
	".jpg":  true,
	".jpeg": true,
	".gif":  true,
}

// HandleImages sert les images stockées localement
func HandleImages(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, "Missing image ID", http.StatusBadRequest)
		return
	}

	typeImg := parts[2]
	id := parts[3]

	// Vérifier l'extension
	ext := filepath.Ext(id)
	if !allowedExtensions[ext] {
		http.Error(w, "Unsupported file type", http.StatusUnsupportedMediaType)
		return
	}

	log.Printf("Handling %s %s", typeImg, id)

	// Construire un chemin sécurisé (empêche les `../`)
	imagePath := filepath.Join("Images", typeImg, id)

	// Ouvrir le fichier
	file, err := os.Open(imagePath)
	if err != nil {
		log.Printf("Image not found: %s", imagePath)
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	// Détecter le type MIME
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		http.Error(w, "Failed to read image", http.StatusInternalServerError)
		return
	}
	_, err = file.Seek(0, 0) // Revenir au début du fichier
	if err != nil {
		http.Error(w, "Failed to reset file pointer", http.StatusInternalServerError)
		return
	}

	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		mimeType = http.DetectContentType(buffer)
	}
	w.Header().Set("Content-Type", mimeType)

	// Envoyer l'image
	_, err = io.Copy(w, file)
	if err != nil {
		http.Error(w, "Failed to send image", http.StatusInternalServerError)
	}
}
