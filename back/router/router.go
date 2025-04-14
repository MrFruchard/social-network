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

	//IMAGES
	// Image Profile Picture
	mux.HandleFunc("GET /api/avatars/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})
	// Image Post
	mux.HandleFunc("GET /api/postImages/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})
	// Image Comment
	mux.HandleFunc("GET /api/commentImages/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})
	// Image Group
	mux.HandleFunc("GET /api/groupImages/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleImages(w, r, db)
	})

	// HOME
	mux.HandleFunc("GET /api/home/post", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleHomePost(w, r, db)
	})
	mux.HandleFunc("GET /api/home/groups", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleHomeGroup(w, r, db)
	})

	// POSTS
	// create a post
	mux.HandleFunc("POST /api/posts", func(w http.ResponseWriter, r *http.Request) {
		handlers.CreatePostHandler(w, r, db)
	}) // --> manque ajout de la liste privée.
	// like/dislike a post
	mux.HandleFunc("POST /api/eventpost/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleEventPost(w, r, db)
	})
	// handle post info ( comment info / count like or dislike )
	mux.HandleFunc("GET /api/post", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetPost(w, r, db)
	})
	// delete post
	mux.HandleFunc("DELETE /api/post/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeletePost(w, r, db)
	})
	// update post
	mux.HandleFunc("PATCH /api/post/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleUpdatePost(w, r, db)
	})
	// get private member post
	mux.HandleFunc("GET /api/privateMember", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetPrivateMember(w, r, db)
	})
	// delete private member post
	mux.HandleFunc("DELETE /api/privateMember", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeletePrivateMember(w, r, db)
	})

	// COMMENT
	// get comment donne déja dans /api/post?=
	mux.HandleFunc("GET /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		//
	})
	// create comment
	mux.HandleFunc("POST /api/comment/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCreateComment(w, r, db)
	})
	// like/dislike comment
	mux.HandleFunc("POST /api/eventcomment/", func(w http.ResponseWriter, r *http.Request) {
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
	// get personal infos
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
	// send message with create conversation option
	mux.HandleFunc("POST /api/message", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleSendMessage(w, r, db, hub)
	})
	// get conversation
	mux.HandleFunc("GET /api/conversation", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetConversation(w, r, db)
	})
	// get messages
	mux.HandleFunc("GET /api/messages", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetMessages(w, r, db)
	})

	//GROUPS
	// create group X
	mux.HandleFunc("POST /api/group/create", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCreateGroup(w, r, db)
	})
	// modify group X
	mux.HandleFunc("PATCH /api/group/update", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleModifyGroup(w, r, db)
	})
	// delete group X
	mux.HandleFunc("DELETE /api/group/delete", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleDeleteGroup(w, r, db)
	})
	// delete member X
	mux.HandleFunc("DELETE /api/group/member", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleBanMemberGroup(w, r, db)
	})
	// ask to join
	mux.HandleFunc("POST /api/group/ask", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleAskToJoinGroup(w, r, db)
	})
	// message conv
	mux.HandleFunc("POST /api/group/message", func(w http.ResponseWriter, r *http.Request) {

	})
	// accept to join
	// decline to join

	//CHECK
	mux.HandleFunc("GET /api/check/username", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCheckUsername(w, r, db)
	})
	mux.HandleFunc("GET /api/check/email", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleCheckEmail(w, r, db)
	})

	// NOTIFICATIONS
	mux.HandleFunc("GET /api/notification", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleGetNotifications(w, r, db)
	})

	// WS
	mux.Handle("/api/ws", http.HandlerFunc(hub.WsHandler))

}
