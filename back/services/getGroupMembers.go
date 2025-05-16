package services

import (
	"database/sql"
)

type InfoGroupMembers struct {
	Users       User `json:"users"`
	IsFollowing bool `json:"is_following"`
}

func GetGroupMember(db *sql.DB, userId, groupId string) ([]InfoGroupMembers, error) {
	var infoUsers []InfoGroupMembers

	query := `SELECT USER_ID FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	rows, err := db.Query(query, groupId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var memberID string
		if err := rows.Scan(&memberID); err != nil {
			return nil, err
		}

		if memberID == userId {
			continue
		}

		var i InfoGroupMembers
		i.Users.ID = memberID

		var username, imgUser sql.NullString
		queryUser := `SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
		err = db.QueryRow(queryUser, memberID).Scan(&i.Users.Lastname, &i.Users.Firstname, &username, &imgUser)
		if err != nil {
			return nil, err
		}

		if username.Valid {
			i.Users.Username = username.String
		}
		if imgUser.Valid {
			i.Users.ProfilePic = imgUser.String
		}

		queryFollow := `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
		err = db.QueryRow(queryFollow, memberID, userId).Scan(&i.IsFollowing)
		if err != nil {
			return nil, err
		}

		infoUsers = append(infoUsers, i)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return infoUsers, nil
}
