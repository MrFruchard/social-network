package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func SendPrivateMemberPosts(db *sql.DB, userId string, postId string) ([]User, error) {
	var p []User
	var owner string

	// Vérifie que l'utilisateur est bien le propriétaire du post
	query := `SELECT USER_ID FROM POSTS WHERE ID = ?`
	err := db.QueryRow(query, postId).Scan(&owner)
	if err != nil {
		return p, err
	}
	
	if owner != userId {
		return p, errors.New("you are not the owner of this post")
	}

	// Récupère les IDs des utilisateurs ayant accès au post privé
	query = `SELECT USER_ID FROM LIST_PRIVATE_POST WHERE POST_ID = ?`
	rows, err := db.Query(query, postId)
	if err != nil {
		return p, err
	}
	defer rows.Close()

	for rows.Next() {
		var u User
		var username, image sql.NullString

		if err := rows.Scan(&u.ID); err != nil {
			return nil, err
		}

		// Récupère les infos utilisateur
		query = `SELECT USERNAME, LASTNAME, FIRSTNAME, IMAGE FROM USER WHERE ID = ?`
		err = db.QueryRow(query, u.ID).Scan(&username, &u.Lastname, &u.Firstname, &image)
		if err != nil {
			return nil, err
		}

		if username.Valid {
			u.Username = username.String
		}
		if image.Valid {
			u.ProfilePic = image.String
		}

		p = append(p, u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return p, nil
}
