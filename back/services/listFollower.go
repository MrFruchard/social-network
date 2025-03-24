package services

import (
	"database/sql"
	"log"
)

type ListOfFollowers struct {
	UserID    string `json:"user_id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Image     string `json:"image"`
	Username  string `json:"username"`
	AboutMe   string `json:"about"`
	Followed  bool   `json:"followed"`
}

func SendListFollower(db *sql.DB, userId, target string, self bool) ([]ListOfFollowers, error) {
	var listOfFollowers []ListOfFollowers

	listOfFollowers = list(db, userId, target)

	return listOfFollowers, nil
}

func list(db *sql.DB, userID, target string) []ListOfFollowers {
	var listOfFollowers []ListOfFollowers

	query := `
		SELECT u.id, u.FIRSTNAME, u.LASTNAME, u.ABOUT_ME, u.IMAGE, u.USERNAME
		FROM FOLLOWERS f
		JOIN USER u ON f.FOLLOWERS = u.id
		WHERE f.USER_ID = ?
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		log.Println("Erreur lors de l'exécution de la requête :", err)
		return listOfFollowers
	}
	defer rows.Close()

	for rows.Next() {
		var follower ListOfFollowers
		var image sql.NullString
		var aboutMe sql.NullString
		var username sql.NullString

		err := rows.Scan(
			&follower.UserID,
			&follower.FirstName,
			&follower.LastName,
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
			follower.Image = image.String
		} else {
			follower.Image = "" // ou une image par défaut
		}
		if aboutMe.Valid {
			follower.AboutMe = aboutMe.String
		} else {
			follower.AboutMe = ""
		}

		if username.Valid {
			follower.Username = username.String
		} else {
			follower.Username = ""
		}

		// Vérifier si c'est un "follow back"
		var id string
		checkFollowQuery := `SELECT ID FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ? LIMIT 1`
		err = db.QueryRow(checkFollowQuery, follower.UserID, target).Scan(&id)
		follower.Followed = err == nil

		listOfFollowers = append(listOfFollowers, follower)
	}

	if err = rows.Err(); err != nil {
		log.Println("Erreur après l'itération des lignes :", err)
	}

	return listOfFollowers
}
