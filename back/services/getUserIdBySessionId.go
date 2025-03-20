package services

import "database/sql"

func GetUserIdBySessionId(sessionId string, db *sql.DB) (string, error) {
	var userId string
	query := `SELECT USER_ID FROM SESSION WHERE SESSION_ID = ?`
	err := db.QueryRow(query, sessionId).Scan(&userId)
	if err != nil {
		return "", err
	}
	return userId, nil
}
