package utils

import (
	"errors"
	"net/http"
	"strings"
)

func ParseUrl(r *http.Request) (string, error) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || strings.TrimSpace(parts[3]) == "" {
		return "", errors.New("missing comment ID")
	}
	id := parts[3]

	return id, nil
}
