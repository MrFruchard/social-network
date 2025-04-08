package services

import (
	"database/sql"
	"github.com/pkg/errors"
	"log"
)

type OnePostInfo struct {
	Id           string        `json:"id"`                //x
	UserId       string        `json:"userId"`            //x
	FirstName    string        `json:"first_name"`        //x
	LastName     string        `json:"last_name"`         //x
	Username     string        `json:"username"`          // null x
	ImageProfile string        `json:"image_profile_url"` // null x
	Content      string        `json:"content"`           // x
	Tags         string        `json:"tags"`              // null x
	ImageContent string        `json:"image_content_url"` // null x
	CreatedAt    string        `json:"created_at"`        // x
	Liked        bool          `json:"liked"`             //x
	Disliked     bool          `json:"disliked"`          //x
	LikeCount    int           `json:"like_count"`        //x
	DislikeCount int           `json:"dislike_count"`     //x
	CommentCount int           `json:"comment_count"`     //x
	Comment      []CommentInfo `json:"comment"`           //
	Followed     bool          `json:"followed"`          //x
	GroupId      GroupIdPost   `json:"group_id"`          // null x
	OwnerUserId  bool          `json:"owner_user_id"`     // x
}

type CommentInfo struct {
	Id           string `json:"id"`                // x
	PostId       string `json:"post_id"`           // x
	UserId       string `json:"user_id"`           // x
	FirstName    string `json:"first_name"`        // x
	LastName     string `json:"last_name"`         // x
	ImageProfile string `json:"image_profile"`     // null x
	Content      string `json:"content"`           // x
	ImageContent string `json:"image_content_url"` // null x
	UserName     string `json:"username"`          // null x
	Liked        bool   `json:"liked"`             // x
	Disliked     bool   `json:"disliked"`          // x
	Followed     bool   `json:"followed"`          // x
	LikeCount    int    `json:"like_count"`        // x
	DislikeCount int    `json:"dislike_count"`     // x
	CreatedAt    string `json:"created_at"`        // x
	UpdatedAt    string `json:"updated_at"`        // null x
}
type GroupIdPost struct {
	Id          string `json:"id"`            //x
	Name        string `json:"name"`          //x
	GroupPicUrl string `json:"group_pic_url"` //x
	Description string `json:"description"`   //x
	CreatedAt   string `json:"created_at"`    //x
}

func GetOnePostInfo(db *sql.DB, userID, postId string) (OnePostInfo, error) {
	var p OnePostInfo

	var private int
	var image, tags, username, groupID sql.NullString
	var accessGroup bool

	query := `SELECT ID, CONTENT, USER_ID, CREATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY FROM POSTS WHERE ID = ? LIMIT 1`
	err := db.QueryRow(query, postId).Scan(&p.Id, &p.Content, &p.UserId, &p.CreatedAt, &image, &tags, &groupID, &private)
	if err != nil {
		return p, err
	}

	if groupID.Valid {
		p.GroupId.Id = groupID.String
		query = `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
		err = db.QueryRow(query, userID, p.GroupId.Id).Scan(&accessGroup)
		if err != nil || (!accessGroup && userID != p.UserId) {
			log.Printf("Post %s ignoré (accès privé refusé pour l'utilisateur %s)", p.Id, userID)
			return p, err
		}
		var groupImage sql.NullString
		query = `SELECT TITLE, IMAGE, CREATED_AT,DESCRIPTION FROM ALL_GROUPS WHERE ID = ?`
		err = db.QueryRow(query, p.GroupId.Id).Scan(&p.GroupId.Name, &groupImage, &p.GroupId.CreatedAt, &p.GroupId.Description)
		if err != nil {
			return p, err
		}
		if groupImage.Valid {
			p.GroupId.GroupPicUrl = groupImage.String
		}
	} else if private == 1 && p.UserId != userID {
		var isFollowed bool
		query = `
		SELECT EXISTS(
			SELECT 1 FROM followers 
			WHERE user_id = ? AND followers = ?
		)
	`
		err = db.QueryRow(query, p.UserId, userID).Scan(&isFollowed)
		if err != nil {
			return p, err
		}
		if !isFollowed {
			return p, errors.New("user is not allowed to view this private profile")
		}
	} else if private == 0 && p.UserId != userID {
		var hasAccess bool
		query = `
		SELECT EXISTS(
			SELECT 1 FROM LIST_PRIVATE_POST 
			WHERE POST_ID = ? AND USER_ID = ?
		)
	`
		err = db.QueryRow(query, postId, userID).Scan(&hasAccess)
		if err != nil {
			return p, err
		}
		if !hasAccess {
			return p, errors.New("user is not allowed to view this private post")
		}
	}

	if p.UserId == userID {
		p.OwnerUserId = true
	} else {
		p.OwnerUserId = false
	}

	var followed bool
	query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
	err = db.QueryRow(query, p.UserId, userID).Scan(&followed)
	if err != nil {
		return p, err
	}

	var imageProfile sql.NullString
	query = `SELECT FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`
	err = db.QueryRow(query, p.UserId).Scan(&p.FirstName, &p.LastName, &imageProfile, &username)
	if err != nil {
		return p, err
	}
	if imageProfile.Valid {
		p.ImageProfile = imageProfile.String
	}

	err = db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'liked'`, postId).Scan(&p.LikeCount)
	if err != nil {
		return p, err
	}
	err = db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'disliked'`, postId).Scan(&p.DislikeCount)
	if err != nil {
		return p, err
	}

	err = db.QueryRow(`SELECT COUNT(*) FROM COMMENT WHERE POST_ID = ?`, postId).Scan(&p.CommentCount)
	if err != nil {
		return p, err
	}

	var eventResult sql.NullString

	query = `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
	err = db.QueryRow(query, p.Id, userID).Scan(&eventResult)
	if err == sql.ErrNoRows {
		// Pas d'interaction → p.Liked restenil
	} else if err != nil {
		log.Println("Erreur récupération du vote :", err)
	} else if eventResult.Valid {
		if eventResult.String == "liked" {
			p.Liked = true
		} else if eventResult.String == "disliked" {
			p.Disliked = true
		}
	}

	if username.Valid {
		p.Username = username.String
	}

	if tags.Valid {
		p.Tags = tags.String
	}

	if image.Valid {
		p.ImageProfile = image.String
	}

	query = `SELECT * FROM COMMENT WHERE POST_ID = ?`
	rows, err := db.Query(query, p.Id)
	if err != nil {
		return p, err
	}

	var comments []CommentInfo

	for rows.Next() {
		var c CommentInfo

		var imageComment, updateAt, imageProfile, usernameC sql.NullString

		err = rows.Scan(&c.Id, &c.PostId, &c.UserId, &c.Content, &imageComment, &c.CreatedAt, &updateAt)
		if err != nil {
			log.Println(err)
			continue
		}

		query = `SELECT FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`
		err = db.QueryRow(query, c.UserId).Scan(&c.FirstName, &c.LastName, &imageProfile, &usernameC)
		if err != nil {
			log.Println(err)
			continue
		}
		if imageComment.Valid {
			c.ImageContent = imageComment.String
		}
		if updateAt.Valid {
			c.UpdatedAt = updateAt.String
		}
		if imageProfile.Valid {
			c.ImageProfile = imageProfile.String
		}
		if usernameC.Valid {
			c.UserName = usernameC.String
		}

		var eventResultC sql.NullString

		query = `SELECT LIKED FROM COMMENT_EVENT WHERE COMMENT_ID = ? AND USER_ID = ?`
		err = db.QueryRow(query, c.Id, userID).Scan(&eventResultC)
		if err == sql.ErrNoRows {
			// Pas d'interaction → c.Liked reste nil
		} else if err != nil {
			log.Println("Erreur récupération du vote :", err)
		} else if eventResultC.Valid {
			if eventResultC.String == "liked" {
				c.Liked = true
			} else if eventResultC.String == "disliked" {
				c.Disliked = true
			}
		}

		err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`, c.UserId, userID).Scan(&c.Followed)
		if err != nil {
			log.Println("Error checking follow status:", err)
			continue
		}

		err = db.QueryRow(`SELECT COUNT(*) FROM COMMENT_EVENT WHERE COMMENT_ID = ? AND LIKED = 'liked'`, c.Id).Scan(&c.LikeCount)
		if err != nil {
			log.Println("Error checking liked count:", err)
			continue
		}

		err = db.QueryRow(`SELECT COUNT(*) FROM COMMENT_EVENT WHERE COMMENT_ID = ? AND LIKED = 'disliked'`, c.Id).Scan(&c.DislikeCount)
		if err != nil {
			log.Println("Error checking liked count:", err)
			continue
		}

		comments = append(comments, c)
	}

	p.Comment = comments

	return p, nil
}
