package router

import (
	"database/sql"
	"net/http"
	"social-network-back/handlers"
	"social-network-back/websocketFile"
)

func Handlers(mux *http.ServeMux, db *sql.DB, hub *websocketFile.Hub) {

	// Register
	mux.HandleFunc("POST /api/register", func(w http.ResponseWriter, r *http.Request) {
		handlers.Register(w, r, db)
	})

	// Login
	mux.HandleFunc("POST /api/login", func(w http.ResponseWriter, r *http.Request) {
		handlers.Login(w, r, db)
	})

	// Logout
	mux.HandleFunc("GET /api/logout", func(w http.ResponseWriter, r *http.Request) {
		handlers.Logout(w, r, db)
	})

	// Image Profile Picture
	mux.HandleFunc("GET /api/avatars/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})

	// Image Post
	mux.HandleFunc("GET /api/postImages/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})

	// POSTS
	// create a post
	mux.HandleFunc("POST /api/posts", func(w http.ResponseWriter, r *http.Request) {
		handlers.CreatePostHandler(w, r, db)
	})
	// like/dislike a post
	mux.HandleFunc("GET /api/eventpost/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleEventPost(w, r, db)
	})
	// handle post info ( comment info / count like or dislike )
	mux.HandleFunc("GET /api/post/", func(w http.ResponseWriter, r *http.Request) {

	})
	// delete post
	mux.HandleFunc("DELETE /api/post/", func(w http.ResponseWriter, r *http.Request) {

	})

	// update post
	mux.HandleFunc("PATCH /api/post/", func(w http.ResponseWriter, r *http.Request) {

	})

	// COMMENT
	// create a comment
	mux.HandleFunc("POST /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCreateComment(w, r, db)
	})
	// like/dislike a comment
	mux.HandleFunc("GET /api/eventcomment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleEventComment(w, r, db)
	})
	// delete comment
	mux.HandleFunc("DELETE /api/comment/", func(w http.ResponseWriter, r *http.Request) {

	})
	// update post
	mux.HandleFunc("PATCH /api/comment/", func(w http.ResponseWriter, r *http.Request) {

	})

	//FOLLOWER
	mux.HandleFunc("GET /api/follow/", func(w http.ResponseWriter, r *http.Request) {

	})

	//MESSAGE

	// WS
	mux.Handle("/api/ws", http.HandlerFunc(hub.WsHandler))

}
