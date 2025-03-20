package utils

import (
	"fmt"
	"net/http"
)

func ErrorResponse(w http.ResponseWriter, code int, err string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_, err2 := w.Write([]byte(fmt.Sprintf(`{"code":%d,"message":"%s"}`, code, err)))
	if err2 != nil {
		return
	}
}
