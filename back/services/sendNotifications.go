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
	PostID    string `json:"post_id"`
	Content   string `json:"content"`
	ImageUrl  string `json:"image_url"`
	CreatedAt string `json:"created_at"`
	User      User   `json:"user"`
}
type CommentData struct {
	CommentID string `json:"comment_id"`
	PostID    string `json:"post_id"`
	Content   string `json:"content"`
	ImageUrl  string `json:"image_url"`
	CreatedAt string `json:"created_at"`
	User      User   `json:"user"`
}
type FollowRequestData struct {
	FollowerID string `json:"follower_id"`
	CreatedAt  string `json:"created_at"`
	Status     string `json:"status"`
	Sender     User   `json:"sender"`
}
type GroupInviteData struct {
	GroupID   string `json:"group_id"`
	GroupPic  string `json:"group_pic"`
	GroupName string `json:"group_name"`
	GroupBio  string `json:"group_bio"`
	CreatedAt string `json:"created_at"`
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
			continue
		}

		switch n.Type {
		case "LIKE", "DISLIKE":
			n.Data, err = createLikeDislikePost(db, idType, userID)
			if err != nil {
				continue
			}
		case "COMMENT", "COMMENT_LIKE", "COMMENT_DISLIKE":
			n.Data, err = commentLikeDislikeComment(db, idType, n.Type, userID)
			if err != nil {
				continue
			}
		case "ASK_FOLLOW":
			n.Data, err = askFollow(db, idType)
			if err != nil {
				continue
			}
		case "INVITE_GROUP":
			n.Data, err = askGroupAndInviteGroup(db, idType)
			if err != nil {
				continue
			}
		default:
			continue
		}

		n.UserID = userID

		n.Read = readInt == 1

		notif = append(notif, n)
	}

	return notif, nil
}

func createLikeDislikePost(db *sql.DB, likeID, cookieUser string) (LikeData, error) {
	var likeData LikeData
	var userID, postID string

	query := `SELECT USER_ID, POST_ID, CREATED_AT FROM POST_EVENT WHERE ID = ?` // je récupère les infos via le likeId
	err := db.QueryRow(query, likeID).Scan(&userID, &postID, &likeData.CreatedAt)
	if err != nil {
		return likeData, err
	}

	var imageUrl sql.NullString

	query = `SELECT CONTENT,IMAGE FROM POSTS WHERE ID = ?`
	err = db.QueryRow(query, postID).Scan(&likeData.Content, &imageUrl)
	if err != nil {
		return likeData, err
	}

	likeData.PostID = postID
	if imageUrl.Valid {
		likeData.ImageUrl = imageUrl.String
	}

	likeData.User, err = getUserByID(db, userID)
	if err != nil {
		return likeData, err
	}

	if cookieUser == userID {
		return likeData, errors.New("User is same as post")
	}

	return likeData, nil
}

func commentLikeDislikeComment(db *sql.DB, commentID, typeId, cookieUser string) (CommentData, error) {
	var c CommentData
	var userTarget string

	var imgComment sql.NullString
	if typeId == "COMMENT_LIKE" || typeId == "COMMENT_DISLIKE" {
		query := `SELECT COMMENT_ID ,USER_ID, CREATED_AT FROM COMMENT_EVENT WHERE ID = ?`

		err := db.QueryRow(query, commentID).Scan(&c.CommentID, &userTarget, &c.CreatedAt)
		if err != nil {
			return c, err
		}

		query = `SELECT POST_ID, CONTENT, IMAGE, CREATED FROM COMMENT WHERE ID = ?`
		err = db.QueryRow(query, c.CommentID).Scan(&c.PostID, &c.Content, &imgComment, &c.CreatedAt)
		if err != nil {
			return c, err
		}
		if imgComment.Valid {
			c.ImageUrl = imgComment.String
		}

		c.User, err = getUserByID(db, userTarget)
		if err != nil {
			return c, err
		}
	}

	if typeId == "COMMENT" {
		c.CommentID = commentID
		query := `SELECT CONTENT, IMAGE, POST_ID, CREATED, USER_ID FROM COMMENT WHERE ID = ?`
		err := db.QueryRow(query, commentID).Scan(&c.Content, &imgComment, &c.PostID, &c.CreatedAt, &userTarget)
		if err != nil {
			return c, err
		}
		if imgComment.Valid {
			c.ImageUrl = imgComment.String
		}
		c.User, err = getUserByID(db, userTarget)
		if err != nil {
			return c, err
		}
	}

	if cookieUser == userTarget {
		return c, errors.New("User is same as post")
	}

	return c, nil
}

func askFollow(db *sql.DB, idFollow string) (FollowRequestData, error) {
	var f FollowRequestData
	var askerID string
	f.FollowerID = idFollow

	query := `SELECT ASKER_ID, CREATED_AT, STATUS FROM REQUEST_FOLLOW WHERE ID = ?`
	err := db.QueryRow(query, idFollow).Scan(&askerID, &f.CreatedAt, &f.Status)
	if err != nil {
		return f, err
	}

	f.Sender, err = getUserByID(db, askerID)
	if err != nil {
		return f, err
	}

	return f, nil
}

func askGroupAndInviteGroup(db *sql.DB, askGroup string) (GroupInviteData, error) {
	var g GroupInviteData
	var askerID string

	query := `SELECT ASKER, GROUP_ID FROM ASK_GROUP WHERE ID = ?`
	err := db.QueryRow(query, askGroup).Scan(&askerID, &g.GroupID)
	if err != nil {
		return g, err
	}

	var imgGroup sql.NullString
	query = `SELECT  TITLE, DESCRIPTION,CREATED_AT, IMAGE FROM ALL_GROUPS WHERE ID = ?`
	err = db.QueryRow(query, g.GroupID).Scan(&g.GroupName, &g.GroupBio, &g.CreatedAt, &imgGroup)
	if err != nil {
		return g, err
	}

	if imgGroup.Valid {
		g.GroupPic = imgGroup.String
	}

	g.User, err = getUserByID(db, askerID)
	if err != nil {
		return g, err
	}

	return g, nil
}

func getUserByID(db *sql.DB, userID string) (User, error) {
	var u User

	var imgUser, username sql.NullString
	query := `SELECT ID,USERNAME, IMAGE, LASTNAME, FIRSTNAME FROM USER WHERE ID = ?`
	err := db.QueryRow(query, userID).Scan(&u.ID, &username, &imgUser, &u.Lastname, &u.Firstname)
	if err != nil {
		return u, err
	}

	if imgUser.Valid {
		u.ProfilePic = imgUser.String
	}
	if username.Valid {
		u.Username = username.String
	}

	return u, nil
}
