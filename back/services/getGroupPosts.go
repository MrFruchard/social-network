package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func GetGroupPosts(db *sql.DB, userId, groupId string) ([]PostProfile, error) {
	var posts []PostProfile
	var isMember bool

	// Vérifie que l'utilisateur est bien membre du groupe
	queryMember := `SELECT EXISTS (SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(queryMember, userId, groupId).Scan(&isMember)
	if err != nil {
		return posts, err
	}
	if !isMember {
		return posts, errors.New("user is not member of group")
	}

	query := `SELECT ID, CONTENT, USER_ID, CREATED_AT, IMAGE FROM POSTS WHERE GROUP_ID = ? ORDER BY CREATED_AT DESC`
	rows, err := db.Query(query, groupId)
	if err != nil {
		return posts, err
	}
	defer rows.Close()

	for rows.Next() {
		var p PostProfile
		var imageContent sql.NullString

		err := rows.Scan(
			&p.Id,
			&p.Content,
			&p.UserId,
			&p.CreatedAt,
			&imageContent,
		)
		if err != nil {
			continue
		}

		// Récupération des infos utilisateur
		var firstName, lastName string
		var username, imageProfile sql.NullString
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

		// Tags
		rowsTags, err := db.Query(`SELECT TAG FROM TAGS WHERE POST_ID = ?`, p.Id)
		if err == nil {
			for rowsTags.Next() {
				var tag string
				if err := rowsTags.Scan(&tag); err == nil {
					p.Tags = append(p.Tags, tag)
				}
			}
			rowsTags.Close()
		}

		// Image du post
		if imageContent.Valid {
			p.ImageContent = imageContent.String
		}

		// Groupe
		p.GroupId.Id = groupId
		err = db.QueryRow(`SELECT TITLE, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`, groupId).
			Scan(&p.GroupId.Name, &p.GroupId.GroupPicUrl, &p.GroupId.CreatedAt)
		if err != nil {
			continue
		}

		// Interactions
		var eventResult sql.NullString
		err = db.QueryRow(`SELECT LIKED FROM POST_EVENT WHERE POST_ID = ? AND USER_ID = ?`, p.Id, userId).
			Scan(&eventResult)
		if err == nil && eventResult.Valid {
			if eventResult.String == "liked" {
				p.Liked = true
			} else if eventResult.String == "disliked" {
				p.Disliked = true
			}
		}

		_ = db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'liked'`, p.Id).Scan(&p.LikeCount)
		_ = db.QueryRow(`SELECT COUNT(*) FROM POST_EVENT WHERE POST_ID = ? AND LIKED = 'disliked'`, p.Id).Scan(&p.DislikeCount)
		_ = db.QueryRow(`SELECT COUNT(*) FROM COMMENT WHERE POST_ID = ?`, p.Id).Scan(&p.CommentCount)

		p.OwnerUserId = userId == p.UserId
		_ = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS =?)`, p.UserId, userId).Scan(&p.Followed)
		p.Privacy = "group"

		posts = append(posts, p)
	}

	return posts, nil
}
