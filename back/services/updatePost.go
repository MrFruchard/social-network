package services

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

func UpdatePost(db *sql.DB, userId, postId, content, tags, image string) error {
	var dbUserID string

	if strings.TrimSpace(content) == "" {
		return errors.New("content cannot be empty")
	}

	query := `SELECT USER_ID FROM POSTS WHERE ID = ?`
	err := db.QueryRow(query, postId).Scan(&dbUserID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("post not found")
		}
		return fmt.Errorf("error fetching post owner: %w", err)
	}

	if dbUserID != userId {
		return errors.New("user ID does not match")
	}

	fields := []string{}
	values := []interface{}{}

	if strings.TrimSpace(content) != "" {
		fields = append(fields, "CONTENT")
		values = append(values, content)
	}

	if strings.TrimSpace(image) != "" {
		fields = append(fields, "IMAGE")
		values = append(values, image)
	}

	if len(fields) == 0 {
		return errors.New("no fields")
	}

	setClause := []string{}
	for _, field := range fields {
		setClause = append(setClause, fmt.Sprintf("%s = ?", field))
	}

	query = fmt.Sprintf("UPDATE POSTS SET %s WHERE ID = ?", strings.Join(setClause, ", "))
	values = append(values, postId)

	_, err = db.Exec(query, values...)
	if err != nil {
		return fmt.Errorf("error updating post owner: %w", err)
	}

	return nil
}
