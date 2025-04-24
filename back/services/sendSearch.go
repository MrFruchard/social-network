package services

import (
	"database/sql"
)

type SearchStruct struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func SendSearch(db *sql.DB, param string) ([]SearchStruct, error) {
	query := `
		SELECT ID, LASTNAME, FIRSTNAME, IMAGE, USERNAME
		FROM USER
		WHERE USERNAME LIKE ? OR LASTNAME LIKE ? OR FIRSTNAME LIKE ?
		LIMIT 20
	`

	likeParam := "%" + param + "%"
	rows, err := db.Query(query, likeParam, likeParam, likeParam)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []SearchStruct

	for rows.Next() {
		var user User
		var image, username sql.NullString

		if err := rows.Scan(&user.ID, &user.Lastname, &user.Firstname, &image, &username); err != nil {
			return nil, err
		}

		if image.Valid {
			user.ProfilePic = image.String
		}
		if username.Valid {
			user.Username = username.String
		}

		results = append(results, SearchStruct{
			Type: "User",
			Data: user,
		})
	}

	groupQuery := `SELECT ID, TITLE, IMAGE,CREATED_AT FROM ALL_GROUPS WHERE TITLE LIKE ?`
	rowsGroups, err := db.Query(groupQuery, likeParam)
	if err != nil {
		return nil, err
	}
	defer rowsGroups.Close()
	for rowsGroups.Next() {
		var g GroupId
		var img sql.NullString

		if err := rowsGroups.Scan(&g.Id, &g.Name, &img, &g.CreatedAt); err != nil {
			return nil, err
		}

		if img.Valid {
			g.GroupPicUrl = img.String
		}

		results = append(results, SearchStruct{
			Type: "Group",
			Data: g,
		})

	}
	return results, nil
}
