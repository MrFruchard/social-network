package services

import (
	"database/sql"
	"log"
)

func SendPostWithTags(db *sql.DB, userID, tag string) ([]PostProfile, error) {

	query := `SELECT POST_ID FROM TAGS WHERE TAG = ?`
	rows, err := db.Query(query, tag)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var post []PostProfile

	for rows.Next() {
		var p PostProfile
		err = rows.Scan(&p.Id)
		if err != nil {
			return nil, err
		}
		var imgUser, imgContent, imgGroup, username, groupID sql.NullString
		var private int
		query = `SELECT CONTENT, USER_ID, CREATED_AT, IMAGE, GROUP_ID, PRIVACY FROM POSTS WHERE ID = ? `
		err = db.QueryRow(query, p.Id).Scan(&p.Content, &p.UserId, &p.CreatedAt, &imgContent, &groupID, &private)
		if err != nil {
			return nil, err
		}

		if imgContent.Valid {
			p.ImageContent = imgContent.String
		}

		if groupID.Valid {
			p.GroupId.Id = groupID.String
			var isMember bool
			query = `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
			err = db.QueryRow(query, p.UserId, p.GroupId.Id).Scan(&isMember)
			if err != nil {
				return nil, err
			}
			if !isMember && userID != p.UserId {
				continue
			}
			query = `SELECT  TITLE, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
			err = db.QueryRow(query, p.GroupId.Id).Scan(&p.GroupId.Name, &imgGroup, &p.GroupId.CreatedAt)
			if err != nil {
				return nil, err
			}
			if imgGroup.Valid {
				p.GroupId.GroupPicUrl = imgGroup.String
			}
		} else if private == 1 {
			var isFollowing bool
			query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
			err = db.QueryRow(query, p.UserId, userID).Scan(&isFollowing)
			if err != nil {
				return nil, err
			}
			if !isFollowing {
				continue
			}
		} else if private == 0 {
			var isInPrivateList bool
			query = `SELECT EXISTS( SELECT 1 FROM  LIST_PRIVATE_POST WHERE USER_ID = ? AND POST_ID = ?)`
			err = db.QueryRow(query, userID, p.Id).Scan(&isInPrivateList)
			if err != nil {
				return nil, err
			}
			if !isInPrivateList {
				continue
			}
		}

		query = `SELECT LASTNAME,FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
		err = db.QueryRow(query, p.UserId).Scan(&p.LastName, &p.FirstName, &username, &imgUser)
		if err != nil {
			return nil, err
		}

		if username.Valid {
			p.Username = username.String
		}

		if imgUser.Valid {
			p.ImageProfile = imgUser.String
		}

		query = `SELECT TAG FROM TAGS WHERE POST_ID = ?`
		rowsTags, err := db.Query(query, p.Id)
		if err != nil {
			log.Printf("Erreur récupération des tags pour le post %s : %v", p.Id, err)
			continue
		}

		for rowsTags.Next() {
			var tag string
			err := rowsTags.Scan(&tag)
			if err != nil {
				log.Printf("Erreur lors du scan d'un tag pour le post %s : %v", p.Id, err)
				continue
			}
			p.Tags = append(p.Tags, tag)
		}
		rowsTags.Close()

		var eventResult sql.NullString

		query = `SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`
		err = db.QueryRow(query, p.Id, userID).Scan(&eventResult)
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

		query = `SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'liked'`
		err = db.QueryRow(query, p.Id).Scan(&p.LikeCount)
		if err != nil {
			log.Printf("Erreur LikeCount pour post %s : %v", p.Id, err)
			return nil, err
		}

		query = `SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'disliked'`
		err = db.QueryRow(query, p.Id).Scan(&p.DislikeCount)
		if err != nil {
			return nil, err
		}

		query = `SELECT COUNT(*) FROM COMMENT WHERE POST_ID = ?`
		err = db.QueryRow(query, p.Id).Scan(&p.CommentCount)
		if err != nil {
			return nil, err
		}

		p.OwnerUserId = userID == p.UserId

		post = append(post, p)
	}

	return post, nil
}
