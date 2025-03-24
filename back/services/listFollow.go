package services

import (
	"database/sql"
	"log"
)

type ListOfFollow struct {
	UserID    string `json:"user_id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Image     string `json:"image"`
	Username  string `json:"username"`
	AboutMe   string `json:"about"`
	Followed  bool   `json:"followed"`
}

func SendListFollow(db *sql.DB, userID, target string) ([]ListOfFollow, error) {
	var listOfFollow []ListOfFollow

	query := `
		SELECT u.id, u.FIRSTNAME, u.LASTNAME, u.ABOUT_ME, u.IMAGE, u.USERNAME
		FROM FOLLOWERS f
		JOIN USER u ON f.USER_ID = u.id
		WHERE f.FOLLOWERS = ?
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		log.Println("Erreur lors de l'exécution de la requête :", err)
		return listOfFollow, err
	}
	defer rows.Close()

	for rows.Next() {
		var follow ListOfFollow
		var image sql.NullString
		var aboutMe sql.NullString
		var username sql.NullString

		err := rows.Scan(
			&follow.UserID,
			&follow.FirstName,
			&follow.LastName,
			&aboutMe,
			&image,
			&username,
		)
		if err != nil {
			log.Println("Erreur lors du scan d'une ligne :", err)
			continue
		}

		// Gestion des NULL
		if image.Valid {
			follow.Image = image.String
		} else {
			follow.Image = "" // ou une image par défaut
		}
		if aboutMe.Valid {
			follow.AboutMe = aboutMe.String
		} else {
			follow.AboutMe = ""
		}

		if username.Valid {
			follow.Username = username.String
		} else {
			follow.Username = ""
		}

		var id string
		checkFollowQuery := `SELECT ID FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ? LIMIT 1`
		err = db.QueryRow(checkFollowQuery, follow.UserID, target).Scan(&id)
		follow.Followed = err == nil

		listOfFollow = append(listOfFollow, follow)
	}

	if err = rows.Err(); err != nil {
		log.Println("Erreur après l'itération des lignes :", err)
	}

	return listOfFollow, nil
}
