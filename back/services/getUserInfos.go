package services

import (
	"database/sql"
)

type UserInfoResponse struct {
	Id            string `json:"id"`
	LastName      string `json:"last_name"`
	FirstName     string `json:"first_name"`
	Email         string `json:"email"`
	About         string `json:"about"`
	Username      string `json:"username"`
	ImageUrl      string `json:"image_url"`
	Public        bool   `json:"public"`
	DateOfBirth   string `json:"date_of_birth"`
	Followers     int    `json:"followers"`
	Following     int    `json:"following"`
	CreatedAt     string `json:"created_at"`
	UnreadMessage int    `json:"unread_message"`
}

func GetUserInfos(db *sql.DB, userId string) (UserInfoResponse, error) {
	var userInfo UserInfoResponse

	var image, username, about sql.NullString
	var public int

	// Nombre de followers
	query1 := `SELECT COUNT(*) FROM FOLLOWERS WHERE USER_ID = ?`
	err := db.QueryRow(query1, userId).Scan(&userInfo.Followers)
	if err != nil {
		return userInfo, err
	}

	// Nombre de following
	query2 := `SELECT COUNT(*) FROM FOLLOWERS WHERE FOLLOWERS = ?`
	err = db.QueryRow(query2, userId).Scan(&userInfo.Following)
	if err != nil {
		return userInfo, err
	}

	// Infos utilisateur
	query3 := `SELECT ID, EMAIL, FIRSTNAME, LASTNAME, ABOUT_ME, USERNAME, IMAGE, PUBLIC, DATE_OF_BIRTH, CREATED_AT FROM USER WHERE ID = ? LIMIT 1`
	row := db.QueryRow(query3, userId)
	err = row.Scan(&userInfo.Id, &userInfo.Email, &userInfo.FirstName, &userInfo.LastName, &about, &username, &image, &public, &userInfo.DateOfBirth, &userInfo.CreatedAt)
	if err != nil {
		return userInfo, err
	}

	// Nullables
	if username.Valid {
		userInfo.Username = username.String
	}
	if image.Valid {
		userInfo.ImageUrl = image.String
	}
	if about.Valid {
		userInfo.About = about.String
	}
	userInfo.Public = public != 0

	// Comptage des messages non lus
	query4 := `SELECT CONVERSATION_ID FROM CONVERSATION_MEMBERS WHERE USER_ID = ?`
	rows, err := db.Query(query4, userId)
	if err != nil {
		return userInfo, err
	}
	defer rows.Close()

	totalUnread := 0
	for rows.Next() {
		var convId string
		err := rows.Scan(&convId)
		if err != nil {
			return userInfo, err
		}

		var unread int
		err = db.QueryRow(`SELECT COUNT(*) FROM MESSAGES WHERE CONVERSATION_ID = ? AND SENDER_ID != ? AND SEEN = 0`, convId, userId).Scan(&unread)
		if err != nil {
			return userInfo, err
		}
		totalUnread += unread
	}

	userInfo.UnreadMessage = totalUnread

	return userInfo, nil
}
