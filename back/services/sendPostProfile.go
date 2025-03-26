package services

import (
	"database/sql"
	"github.com/pkg/errors"
	"log"
)

type PostProfile struct {
	Id           string  `json:"id"`                // x
	UserId       string  `json:"userId"`            // x
	FirstName    string  `json:"first_name"`        // x
	LastName     string  `json:"last_name"`         // x
	Username     string  `json:"username"`          // null x
	ImageProfile string  `json:"image_profile_url"` // null x
	Content      string  `json:"content"`           // x
	Tags         string  `json:"tags"`              // null x
	ImageContent string  `json:"image_content_url"` // null x
	CreatedAt    string  `json:"created_at"`        // x
	Liked        bool    `json:"liked"`             // x
	LikeCount    int     `json:"like_count"`        // x
	DislikeCount int     `json:"dislike_count"`     // x
	CommentCount int     `json:"comment_count"`
	Followed     bool    `json:"followed"` // x
	GroupId      GroupId `json:"group_id"` // null x
	OwnerUserId  bool    `json:"owner_user_id"`
}
type GroupId struct {
	Id          string `json:"id"`            // x
	Name        string `json:"name"`          // x
	GroupPicUrl string `json:"group_pic_url"` // x
	CreatedAt   string `json:"created_at"`    // x
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
		query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
		err = db.QueryRow(query, targetId, userId).Scan(&follow)
		if err != nil {
			return postProfile, err
		}
		if !follow && userId != targetId {
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

	query := `SELECT ID, CONTENT, USER_ID, CREATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY FROM POSTS WHERE USER_ID = ? LIMIT 10 OFFSET 0;`
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
			if !accessPrivate && userId != targetId {
				continue
			}
		}

		if groupId.Valid {
			p.GroupId.Id = groupId.String
			query = `SELECT EXISTS(SELECT ID FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
			err = db.QueryRow(query, userId, p.GroupId.Id).Scan(&accessGroup)
			if err != nil {
				log.Printf("Erreur lors de la vérification d'accès privé : %v", err)
				continue
			}
			if !accessPrivate && userId != targetId {
				log.Printf("Post %s ignoré (accès privé refusé pour l'utilisateur %s)", p.Id, userId)
				continue
			}
			query = `SELECT TITLE, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
			err = db.QueryRow(query, p.GroupId.Id).Scan(&p.GroupId.Name, &p.GroupId.GroupPicUrl, &p.GroupId.CreatedAt)
			if err != nil {
				log.Printf("Erreur lors de la vérification d'accès privé : %v", err)
				continue
			}
		}

		var eventResult string

		query = `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
		err = db.QueryRow(query, p.Id, userId).Scan(&eventResult)
		if err != nil {
			if err != sql.ErrNoRows {
				log.Println(err)
			}
		} else {
			if eventResult == "liked" {
				p.Liked = true
			} else if eventResult == "disliked" {
				p.Liked = false
			}
		}

		query = `SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'liked'`
		err = db.QueryRow(query, p.Id).Scan(&p.LikeCount)
		if err != nil {
			log.Printf("Erreur LikeCount pour post %s : %v", p.Id, err)
			continue
		}

		query = `SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'disliked'`
		err = db.QueryRow(query, p.Id).Scan(&p.DislikeCount)
		if err != nil {
			continue
		}

		query = `SELECT COUNT(*) FROM COMMENT WHERE POST_ID = ?`
		err = db.QueryRow(query, p.Id).Scan(&p.CommentCount)
		if err != nil {
			continue
		}

		p.FirstName = firstName
		p.LastName = lastName
		if imageProfile.Valid {
			p.ImageProfile = imageProfile.String
		}
		if username.Valid {
			p.Username = username.String
		}

		if userId == targetId {
			p.OwnerUserId = true
		} else {
			p.OwnerUserId = false
		}

		if tags.Valid {
			p.Tags = tags.String
		}

		if imageContent.Valid {
			p.ImageContent = imageContent.String
		}

		postProfile = append(postProfile, p)

	}

	return postProfile, nil
}
