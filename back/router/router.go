package router

import (
	"database/sql"
	"net/http"
	"social-network/handlers"
	"social-network/websocketFile"
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
		handlers.HandleDeletePost(w, r, db)
	})
	// update post
	mux.HandleFunc("PATCH /api/post/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUpdatePost(w, r, db)
	})

	// COMMENT
	// create comment
	mux.HandleFunc("POST /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCreateComment(w, r, db)
	})
	// like/dislike comment
	mux.HandleFunc("GET /api/eventcomment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleEventComment(w, r, db)
	})
	// delete comment
	mux.HandleFunc("DELETE /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeleteComment(w, r, db)
	})
	// update post
	mux.HandleFunc("PATCH /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUpdateComment(w, r, db)
	})

	//FOLLOWER
	// ask to follow
	mux.HandleFunc("POST /api/user/follow", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleAskFollow(w, r, db)
	})
	// accept follow
	mux.HandleFunc("POST /api/user/agree", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleFollowAgreement(w, r, db)
	})
	// decline follow
	mux.HandleFunc("POST /api/user/decline", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeclineFollow(w, r, db)
	})
	// unfollow
	mux.HandleFunc("POST /api/user/unfollow", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUnfollowAgreement(w, r, db)
	})
	// delete follower
	mux.HandleFunc("DELETE /api/user/deletefollower", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeleteFollow(w, r, db)
	})
	// list followers
	mux.HandleFunc("GET /api/user/listfollower", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleListFollowers(w, r, db)
	})
	// list follow
	mux.HandleFunc("GET /api/user/listfollow", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleFollow(w, r, db)
	})

	//USER
	//  get personal infos
	mux.HandleFunc("GET /api/user/info", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUserPersonal(w, r, db)
	})
	// get user infos
	mux.HandleFunc("GET /api/user/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUserInfos(w, r, db)
	})
	// switch public status
	mux.HandleFunc("PATCH /api/user/public", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleSwitchPublicStatus(w, r, db)
	})

	// PROFILE
	mux.HandleFunc("GET /api/profile/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetPostProfile(w, r, db)
	})

	//MESSAGE

	//GROUPS

	//CHECK
	mux.HandleFunc("GET /api/check/username", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCheckUsername(w, r, db)
	})
	mux.HandleFunc("GET /api/check/email", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCheckEmail(w, r, db)
	})

	// WS
	mux.Handle("/api/ws", http.HandlerFunc(hub.WsHandler))

}
