package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

type Notification struct {
	ID        string      `json:"id"`
	UserID    string      `json:"user_id"`
	Type      string      `json:"type"`
	Read      bool        `json:"read"`
	CreatedAt string      `json:"created_at"`
	Data      interface{} `json:"data"` // à changer selon le type de notification
}
type LikeData struct {
	PostID   string `json:"post_id"`
	Content  string `json:"content"`
	ImageUrl string `json:"image_url"`
	User     User   `json:"user"`
}
type CommentData struct {
	CommentID string `json:"comment_id"`
	PostID    string `json:"post_id"`
	Content   string `json:"content"`
	ImageUrl  string `json:"image_url"`
	User      User   `json:"user"`
}
type FollowRequestData struct {
	FollowerID string `json:"follower_id"`
	Sender     User   `json:"sender"`
}
type GroupInviteData struct {
	GroupID   string `json:"group_id"`
	GroupName string `json:"group_name"`
	GroupBio  string `json:"group_bio"`
	User      User   `json:"user"`
}

func SendNotifications(db *sql.DB, userID string) ([]Notification, error) {
	var notif []Notification

	query := `SELECT ID, TYPE, ID_TYPE, READ, CREATED_AT FROM NOTIFICATIONS WHERE USER_ID = ?`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var n Notification
		var readInt int
		var idType string

		err = rows.Scan(&n.ID, &n.Type, &idType, &readInt, &n.CreatedAt)
		if err != nil {
			return nil, err
		}

		switch n.Type {
		case "LIKE", "DISLIKE":
			n.Data, err = createLikeDislikePost(db, idType, userID)
			if err != nil {
				return nil, err
			}
		case "COMMENT", "COMMENT_LIKE", "COMMENT_DISLIKE":
			n.Data, err = commentLikeDislikeComment(db, idType, userID)
			if err != nil {
				return nil, err
			}
		case "ASK_FOLLOW":
			n.Data, err = askFollow(db, idType, userID)
			if err != nil {
				return nil, err
			}
		case "ASK_GROUP", "ASK_INVITE":
			n.Data, err = askGroupAndInviteGroup(db, idType, userID)
			if err != nil {
				return nil, err
			}
		default:
			return nil, errors.New("unknown notification type: " + n.Type)
		}

		n.UserID = userID

		n.Read = readInt == 1

		notif = append(notif, n)
	}

	return notif, nil
}

func createLikeDislikePost(db *sql.DB, postId, userID string) (LikeData, error) {
	var likeData LikeData

	return likeData, nil
}

func commentLikeDislikeComment(db *sql.DB, postId, userID string) (CommentData, error) {
	var commentData CommentData

	return commentData, nil
}

func askFollow(db *sql.DB, postId, userID string) (FollowRequestData, error) {
	var followRequestData FollowRequestData

	return followRequestData, nil
}

func askGroupAndInviteGroup(db *sql.DB, postId, userID string) (GroupInviteData, error) {
	var groupInfo GroupInviteData

	return groupInfo, nil
}
