package services

import (
	"database/sql"
)

type GroupHome struct {
	Id          string `json:"id"`
	Owner       string `json:"owner"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"` // null
	CreatedAt   string `json:"created_at"`
}

func SendGroupHome(db *sql.DB, userID string) ([]GroupHome, []GroupHome, error) {
	listGroup, Discovery, err := listGroupHome(db, userID)
	if err != nil {
		return nil, nil, err
	}

	return listGroup, Discovery, nil
}

func listGroupHome(db *sql.DB, userID string) ([]GroupHome, []GroupHome, error) {
	var listGroup []GroupHome
	query := `
	SELECT ag.ID, ag.OWNER, ag.TITLE,ag.DESCRIPTION, ag.IMAGE,ag.CREATED_AT
	FROM GROUPS_MEMBERS gm
	JOIN ALL_GROUPS ag ON gm.GROUP_ID = ag.ID
	WHERE gm.USER_ID = ?
`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var g GroupHome
		if err := rows.Scan(&g.Id, &g.Owner, &g.Title, &g.Description, &g.Image, &g.CreatedAt); err != nil {
			return nil, nil, err
		}

		listGroup = append(listGroup, g)
	}

	var Discovery []GroupHome
	query = `
	SELECT ag.ID, ag.OWNER, ag.TITLE, ag.DESCRIPTION, ag.IMAGE, ag.CREATED_AT
	FROM ALL_GROUPS ag
	WHERE ag.ID NOT IN (
		SELECT gm.GROUP_ID
		FROM GROUPS_MEMBERS gm
		WHERE gm.USER_ID = ?
);`
	rows, err = db.Query(query, userID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var g GroupHome
		if err := rows.Scan(&g.Id, &g.Owner, &g.Title, &g.Description, &g.Image, &g.CreatedAt); err != nil {
			return nil, nil, err
		}
		Discovery = append(Discovery, g)
	}

	return listGroup, Discovery, nil
}
