package middlewares

import (
	"database/sql"
	"golang.org/x/time/rate"
	"log"
	"net/http"
	"social-network/utils"
	"sync"
	"time"
)

var (
	limiters     = make(map[string]*rate.Limiter)
	mu           sync.Mutex
	loginLimiter = rate.NewLimiter(10, 20)
	cleanTicker  = time.NewTicker(5 * time.Minute)
)

func init() {
	go func() {
		for range cleanTicker.C {
			cleanLimiter()
		}
	}()
}

func cleanLimiter() {
	mu.Lock()
	defer mu.Unlock()
	for name, limiter := range limiters {
		if limiter.Allow() {
			delete(limiters, name)
		}
	}
}

func getLimiter(userID string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	if limiter, exists := limiters[userID]; exists {
		return limiter
	}

	limiter := rate.NewLimiter(20, 35)
	limiters[userID] = limiter
	return limiter
}

func RateLimitMiddleware(next http.Handler, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/login" || r.URL.Path == "/api/register" || r.URL.Path == "/" || r.URL.Path == "/api/check/username" || r.URL.Path == "/api/check/email" {
			if !loginLimiter.Allow() {
				http.Error(w, "429 Too Many Requests", http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
			return
		}

		userId, pass := AuthMiddleware(r, db)
		if !pass {
			utils.ErrorResponse(w, http.StatusUnauthorized, "unauthorized")
			log.Println("unauthorized")
			return
		}

		if r.URL.Path == "/api/checkAuth" {
			utils.SuccessResponse(w, http.StatusOK, "Ok")
			return
		}

		limiter := getLimiter(userId)
		if !limiter.Allow() {
			http.Error(w, http.StatusText(http.StatusTooManyRequests), http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}
