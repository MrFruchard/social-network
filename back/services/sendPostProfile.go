package services

import (
	"database/sql"
	"github.com/pkg/errors"
	"log"
)

type PostProfile struct {
	Id           string `json:"id"`
	UserId       string `json:"userId"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Username     string `json:"username"`          // null
	ImageProfile string `json:"image_profile_url"` // null
	Content      string `json:"content"`
	Tags         string `json:"tags"`              // null
	ImageContent string `json:"image_content_url"` // null
	CreatedAt    string `json:"created_at"`
	Liked        bool   `json:"liked"`
	Disliked     bool   `json:"disliked"`
	LikeCount    int    `json:"like_count"`
	DislikeCount int    `json:"dislike_count"`
	CommentCount int    `json:"comment_count"`
	Followed     bool   `json:"followed"`
	GroupId      string `json:"group_id"` //null
}

func SendPostProfile(db *sql.DB, userId, targetId string) ([]PostProfile, error) {
	var postProfile []PostProfile

	var public int
	query := `SELECT PUBLIC FROM USER WHERE ID = ?`
	err := db.QueryRow(query, targetId).Scan(&public)
	if err != nil {
		return postProfile, err
	}

	if public == 0 {
		var follow bool
		query = `SELECT EXISTS(SELECT ID FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
		err = db.QueryRow(query, targetId, userId).Scan(&follow)
		if err != nil {
			return postProfile, err
		}
		if !follow {
			return postProfile, errors.New("Not Followed")
		}
	}

	postProfile, err = structData(db, userId, targetId)
	if err != nil {
		return postProfile, err
	}

	return postProfile, nil
}

func structData(db *sql.DB, userId, targetId string) ([]PostProfile, error) {
	var postProfile []PostProfile

	query := `SELECT ID, CONTENT, USER_ID, CREATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY FROM POSTS WHERE USER_ID = ? LIMIT 10 OFFSET 10;`
	rows, err := db.Query(query, targetId)
	if err != nil {
		return postProfile, err
	}
	defer rows.Close()

	var firstName, lastName string
	var username, imageProfile sql.NullString

	err = db.QueryRow(`SELECT FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`, targetId).Scan(&firstName, &lastName, &imageProfile, &username)
	if err != nil {
		return postProfile, err
	}

	for rows.Next() {
		var p PostProfile

		var imageContent, tags, groupId sql.NullString
		var privacy int
		var accessPrivate, accessGroup bool

		err = rows.Scan(
			&p.Id,
			&p.Content,
			&p.UserId,
			&p.CreatedAt,
			&imageContent,
			&tags,
			&groupId,
			&privacy,
		)
		if err != nil {
			return postProfile, err
		}

		if imageProfile.Valid {
			p.ImageProfile = imageProfile.String
		}

		if privacy == 0 {
			query = `SELECT EXISTS(SELECT ID FROM LIST_PRIVATE_POST WHERE USER_ID = ? AND POST_ID = ?)`
			err = db.QueryRow(query, userId, p.Id).Scan(&accessPrivate)
			if err != nil {
				log.Printf("Erreur lors de la vérification d'accès privé : %v", err)
				continue
			}
			if !accessPrivate {
				continue
			}
		}

		if groupId.Valid {
			p.GroupId = groupId.String
			query = `SELECT EXISTS(SELECT ID FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
			err = db.QueryRow(query, userId, p.GroupId).Scan(&accessGroup)
			if err != nil {
				log.Printf("Erreur lors de la vérification d'accès privé : %v", err)
				continue
			}
			if !accessGroup {
				continue
			}
		}

		p.FirstName = firstName
		p.LastName = lastName
		if imageProfile.Valid {
			p.ImageProfile = imageProfile.String
		}
		if username.Valid {
			p.Username = username.String
		}

		postProfile = append(postProfile, p)

	}

	return postProfile, nil
}
