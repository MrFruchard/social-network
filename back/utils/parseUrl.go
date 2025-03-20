package utils

import (
	"errors"
	"net/http"
	"strings"
)

func ParseUrl(r *http.Request) (string, error) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 || parts[2] == "" {
		return "", errors.New("missing comment ID")
	}
	id := parts[2]

	return id, nil
}
