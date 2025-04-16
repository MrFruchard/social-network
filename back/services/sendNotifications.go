package services

import (
	"database/sql"
)

type Notification struct {
	Type string `json:"type"`
	User User   `json:"user"`
}

func SendNotifications(db *sql.DB, userID string) ([]Notification, error) {
	var n []Notification

	return n, nil
}
