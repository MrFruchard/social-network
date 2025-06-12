package services

import (
	"database/sql"
	"github.com/pkg/errors"
)

type EventInfos struct {
	Id       string `json:"id"`
	GroupId  string `json:"group_id"`
	Sender   User   `json:"sender"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	OptionA  string `json:"option_a"`
	OptionB  string `json:"option_b"`
	Created  string `json:"created_at"`
	DateTime string `json:"date_time"`
	Choice   int    `json:"choice"`
	CountA   int    `json:"count_a"`
	CountB   int    `json:"count_b"`
}

func SendEventInfos(db *sql.DB, userId, groupId string) ([]EventInfos, error) {
	var eventInfos []EventInfos
	var isMember bool

	query := `SELECT EXISTS(SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(query, userId, groupId).Scan(&isMember)
	if err != nil {
		return eventInfos, err
	}

	if !isMember {
		return eventInfos, errors.New("user is not member of group")
	}

	queryRows := `SELECT ID, SENDER, DESCRIPTION, OPTION_A, OPTION_B, CREATED_AT, TITLE, DATE_TIME FROM GROUPS_EVENT WHERE GROUP_ID = ?`
	rows, err := db.Query(queryRows, groupId)
	if err != nil {
		return eventInfos, err
	}
	defer rows.Close()

	for rows.Next() {
		var e EventInfos
		e.GroupId = groupId

		err = rows.Scan(&e.Id, &e.Sender.ID, &e.Desc, &e.OptionA, &e.OptionB, &e.Created, &e.Title, &e.DateTime)
		if err != nil {
			return eventInfos, err
		}

		var imgUser, username sql.NullString
		_ = db.QueryRow(`SELECT LASTNAME, FIRSTNAME, USERNAME, IMAGE FROM USER WHERE ID = ?`, e.Sender.ID).
			Scan(&e.Sender.Lastname, &e.Sender.Firstname, &username, &imgUser)

		if imgUser.Valid {
			e.Sender.ProfilePic = imgUser.String
		}
		if username.Valid {
			e.Sender.Username = username.String
		}

		// ✅ Choix de l'utilisateur
		queryChoice := `SELECT RESPONSE FROM RESPONSE_EVENT WHERE USER_ID = ? AND EVENT_ID = ?`
		err = db.QueryRow(queryChoice, userId, e.Id).Scan(&e.Choice)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				e.Choice = -1 // Aucun choix encore
				err = nil
			} else {
				return eventInfos, err
			}
		}

		// ✅ Comptage des votes pour Option A (0) et Option B (1)
		_ = db.QueryRow(`SELECT COUNT(*) FROM RESPONSE_EVENT WHERE EVENT_ID = ? AND RESPONSE = 1`, e.Id).Scan(&e.CountA)
		_ = db.QueryRow(`SELECT COUNT(*) FROM RESPONSE_EVENT WHERE EVENT_ID = ? AND RESPONSE = 2`, e.Id).Scan(&e.CountB)

		eventInfos = append(eventInfos, e)
	}

	return eventInfos, nil
}
