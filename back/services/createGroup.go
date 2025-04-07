package services

import (
	"database/sql"
	"github.com/google/uuid"
)

func CreateGroup(db *sql.DB, userID, title, desc, img string) error {
	groupId := uuid.New().String()
	memberId := uuid.New().String()
	query := `INSERT INTO ALL_GROUPS VALUES (?,?,?,?,?,datetime('now'))`
	_, err := db.Exec(query, groupId, title, desc, userID, img)
	if err != nil {
		return err
	}
	query = `INSERT INTO GROUPS_MEMBERS VALUES (?,?,?,datetime('now'))`
	_, err = db.Exec(query, memberId, userID, groupId)
	if err != nil {
		return err
	}
	return nil
}
