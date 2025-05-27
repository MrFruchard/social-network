package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

func ListAskToJoinGroup(userID, groupID string, db *sql.DB) ([]User, error) {
	var u []User
	var isOwner bool

	query := `SELECT EXISTS(SELECT 1 FROM ALL_GROUPS WHERE OWNER = ? AND ID = ? )`
	err := db.QueryRow(query, userID, groupID).Scan(&isOwner)
	if err != nil {
		return nil, err
	}

	if !isOwner {
		return nil, errors.New("user is not owner of group " + groupID)
	}

	queryAskGroup := `SELECT ASKER FROM ASK_GROUP WHERE GROUP_ID = ? AND ACCEPTED = 0 `
	rows, err := db.Query(queryAskGroup, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var us User
		var username, img sql.NullString

		err = rows.Scan(&us.ID)
		if err != nil {
			return nil, err
		}

		queryUser := `SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`
		err = db.QueryRow(queryUser, us.ID).Scan(&us.Lastname, &us.Firstname, &username, &img)
		if err != nil {
			return nil, err
		}

		if img.Valid {
			us.ProfilePic = img.String
		}

		if username.Valid {
			us.Username = username.String
		}

		u = append(u, us)
	}

	return u, nil
}
