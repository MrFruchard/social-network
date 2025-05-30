package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

type EventInfos struct {
	Id      string `json:"id"`
	GroupId string `json:"group_id"`
	Sender  User   `json:"sender"`
	Desc    string `json:"desc"`
	OptionA string `json:"option_a"`
	OptionB string `json:"option_b"`
	Created string `json:"created_at"`
	Choice  int    `json:"choice"`
}

func SendEventInfos(db *sql.DB, userId, groupId string) ([]EventInfos, error) {
	var eventInfos []EventInfos
	var isMember bool

	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID =?  AND GROUP_ID =? )`
	err := db.QueryRow(query, userId, groupId).Scan(&isMember)
	if err != nil {
		return eventInfos, err
	}

	if !isMember {
		return eventInfos, errors.New("user is not member of group")
	}

	queryRows := `SELECT ID, SENDER, DESCRIPTION, OPTION_A, OPTION_B, CREATED_AT FROM GROUPS_EVENT WHERE GROUP_ID =? `
	rows, err := db.Query(queryRows, groupId)
	if err != nil {
		return eventInfos, err
	}
	defer rows.Close()
	for rows.Next() {
		var e EventInfos
		e.GroupId = groupId

		err = rows.Scan(&e.Id, &e.Sender.ID, &e.Desc, &e.OptionA, &e.OptionB, &e.Created)
		if err != nil {
			return eventInfos, err
		}
		var imgUser, username sql.NullString
		_ = db.QueryRow(`SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`, e.Sender.ID).Scan(&e.Sender.Lastname, &e.Sender.Firstname, &username, &imgUser)

		if imgUser.Valid {
			e.Sender.ProfilePic = imgUser.String
		}

		if username.Valid {
			e.Sender.Username = username.String
		}

		queryChoice := `SELECT RESPONSE FROM RESPONSE_EVENT WHERE USER_ID = ? AND EVENT_ID = ?`
		err = db.QueryRow(queryChoice, userId, e.Id).Scan(&e.Choice)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				e.Choice = 0
				err = nil
			} else {
				return eventInfos, err // Une autre erreur est survenue
			}
		}

		eventInfos = append(eventInfos, e)
	}

	return eventInfos, nil
}
