package services

import (
	"database/sql"
	"log"
)

func SendHomePost(db *sql.DB, userId string) ([]PostProfile, error) {
	postProfile, err := structHomePost(db, userId, 0)
	if err != nil {
		return postProfile, err
	}

	return postProfile, nil
}

func structHomePost(db *sql.DB, userId string, offset int) ([]PostProfile, error) {
	var postProfile []PostProfile

	query := `SELECT ID, CONTENT, USER_ID, CREATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY 
	          FROM POSTS ORDER BY CREATED_AT DESC LIMIT 20 OFFSET ?`

	rows, err := db.Query(query, offset)
	if err != nil {
		return postProfile, err
	}
	defer rows.Close()

	for rows.Next() {
		var p PostProfile
		var imageContent, tags, groupId sql.NullString
		var privacy int
		var accessPrivate, accessGroup bool

		err = rows.Scan(&p.Id, &p.Content, &p.UserId, &p.CreatedAt, &imageContent, &tags, &groupId, &privacy)
		if err != nil {
			return postProfile, err
		}

		if privacy == 1 || p.UserId == userId {
			query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
			err = db.QueryRow(query, p.UserId, userId).Scan(&accessPrivate)
			if err != nil || (!accessPrivate && userId != p.UserId) {
				log.Printf("Post %s ignoré (accès privé refusé pour l'utilisateur %s)", p.Id, userId)
				continue
			}
		}

		if privacy == 0 || p.UserId == userId {
			query = `SELECT EXISTS(SELECT 1 FROM LIST_PRIVATE_POST WHERE USER_ID = ? AND POST_ID = ?)`
			err = db.QueryRow(query, userId, p.Id).Scan(&accessPrivate)
			if err != nil || (!accessPrivate && userId != p.UserId) {
				log.Printf("Post %s ignoré (accès privé refusé pour l'utilisateur %s)", p.Id, userId)
				continue
			}
		}

		if groupId.Valid || p.UserId == userId {
			p.GroupId.Id = groupId.String
			query = `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
			err = db.QueryRow(query, userId, p.GroupId.Id).Scan(&accessGroup)
			if err != nil || (!accessGroup && userId != p.UserId) {
				log.Printf("Post %s ignoré (accès privé refusé pour l'utilisateur %s)", p.Id, userId)
				continue
			}
			query = `SELECT TITLE, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
			err = db.QueryRow(query, p.GroupId.Id).Scan(&p.GroupId.Name, &p.GroupId.GroupPicUrl, &p.GroupId.CreatedAt)
			if err != nil {
				continue
			}
		}

		var eventResult sql.NullString

		query = `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
		err = db.QueryRow(query, p.Id, userId).Scan(&eventResult)
		if err == sql.ErrNoRows {
			// Pas d'interaction → p.Liked reste nil
		} else if err != nil {
			log.Println("Erreur récupération du vote :", err)
		} else if eventResult.Valid {
			if eventResult.String == "liked" {
				p.Liked = true
			} else if eventResult.String == "disliked" {
				p.Disliked = true
			}
		}

		db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'liked'`, p.Id).Scan(&p.LikeCount)
		db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'disliked'`, p.Id).Scan(&p.DislikeCount)
		db.QueryRow(`SELECT COUNT(*) FROM COMMENT WHERE POST_ID = ?`, p.Id).Scan(&p.CommentCount)

		var firstName, lastName string
		var imageProfile, username sql.NullString

		err = db.QueryRow(`SELECT FIRSTNAME, LASTNAME, IMAGE, USERNAME FROM USER WHERE ID = ?`, p.UserId).
			Scan(&firstName, &lastName, &imageProfile, &username)
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
		p.OwnerUserId = userId == p.UserId

		if tags.Valid {
			p.Tags = tags.String
		}
		if imageContent.Valid {
			p.ImageContent = imageContent.String
		}

		postProfile = append(postProfile, p)
	}

	if err = rows.Err(); err != nil {
		return postProfile, err
	}

	return postProfile, nil
}
