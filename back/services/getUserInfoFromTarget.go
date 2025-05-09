package services

import "database/sql"

type UserInfoResponseFromTarget struct {
	Id          string `json:"id"`
	LastName    string `json:"last_name"`
	FirstName   string `json:"first_name"`
	About       string `json:"about"`
	Username    string `json:"username"`
	ImageUrl    string `json:"image_url"`
	Public      bool   `json:"public"`
	Followers   int    `json:"followers"`
	Following   int    `json:"following"`
	CreatedAt   string `json:"created_at"`
	IsFollowing int    `json:"is_following"`
}

func GetUserInfoFromTarget(db *sql.DB, targetId, userID string) (UserInfoResponseFromTarget, error) {
	var userInfo UserInfoResponseFromTarget

	var image, username, about sql.NullString
	var public int

	query1 := `SELECT COUNT(*) FROM FOLLOWERS WHERE USER_ID = ?`
	err1 := db.QueryRow(query1, targetId).Scan(&userInfo.Followers)
	if err1 != nil {
		return userInfo, err1
	}
	query2 := `SELECT COUNT(*) FROM FOLLOWERS WHERE FOLLOWERS = ?`
	err2 := db.QueryRow(query2, targetId).Scan(&userInfo.Following)
	if err2 != nil {
		return userInfo, err2
	}

	query := "SELECT ID,FIRSTNAME,LASTNAME,ABOUT_ME,USERNAME,IMAGE,PUBLIC, CREATED_AT FROM USER WHERE ID = ? LIMIT 1"
	row := db.QueryRow(query, targetId)

	err := row.Scan(&userInfo.Id, &userInfo.FirstName, &userInfo.LastName, &about, &username, &image, &public, &userInfo.CreatedAt)
	if err != nil {
		return userInfo, err
	}

	// Affecter les valeurs dans la struct, en gérant les NULL
	if username.Valid {
		userInfo.Username = username.String
	}
	if image.Valid {
		userInfo.ImageUrl = image.String
	}
	if about.Valid {
		userInfo.About = about.String
	}

	userInfo.Public = !(public == 0)

	var isFollowing bool
	query = `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)`
	err = db.QueryRow(query, targetId, userID).Scan(&isFollowing)
	if err != nil {
		return userInfo, err
	}

	if isFollowing {
		userInfo.IsFollowing = 1
		return userInfo, nil

	}

	var isOnWaiting bool
	query = `SELECT EXISTS(SELECT 1 FROM REQUEST_FOLLOW WHERE ASKER_ID = ? AND RECEIVER_ID = ? )`
	err = db.QueryRow(query, userID, targetId).Scan(&isOnWaiting)
	if err != nil {
		return userInfo, err
	}

	if isOnWaiting {
		userInfo.IsFollowing = 2
		return userInfo, nil
	}

	userInfo.IsFollowing = 0

	return userInfo, nil
}
