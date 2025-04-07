package utils

import (
	"fmt"
	"github.com/google/uuid"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

var allowedImages = map[string]bool{
	"image/png":  true,
	"image/gif":  true,
	"image/jpg":  true,
	"image/jpeg": true,
}

func SaveImage(dir string, file multipart.File, header *multipart.FileHeader) (string, error) {
	var u = uuid.New().String()

	// path ou dl le l'image
	uploadDir := fmt.Sprintf("%s/", dir)
	err := os.MkdirAll(uploadDir, os.ModePerm) // Crée le dossier si le dossier n'existe pas
	if err != nil {
		return "", err
	}

	// lecture de l'image
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "", err
	}

	// Vérifie si le fichier est du bon type
	contentType := http.DetectContentType(buffer)
	if !allowedImages[contentType] {
		return "", fmt.Errorf("unsupported image type : %s", contentType)
	}

	_, err = file.Seek(0, io.SeekStart) // Réinitialisation du pointeur du fichier
	if err != nil {
		return "", err
	}
	fileExt := filepath.Ext(header.Filename)
	fileName := u + fileExt
	filePath := uploadDir + fileName

	// crée et enregistre le fichier
	out, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		return "", err
	}

	return fileName, nil
}
