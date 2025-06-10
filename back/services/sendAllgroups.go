package services

import (
	"database/sql"
)

func SendAllGroup(db *sql.DB, userId string) ([]GroupId, error) {
	var groups []GroupId

	// 1. Récupérer tous les IDs des groupes de l'utilisateur
	groupIDQuery := `SELECT GROUP_ID FROM GROUPS_MEMBERS WHERE USER_ID = ?`
	rows, err := db.Query(groupIDQuery, userId)
	if err != nil {
		return groups, err
	}
	defer rows.Close()

	var groupIDs []string
	for rows.Next() {
		var groupID string
		if err := rows.Scan(&groupID); err != nil {
			return groups, err
		}
		groupIDs = append(groupIDs, groupID)
	}

	// 2. Pour chaque ID de groupe, récupérer ses détails
	groupQuery := `SELECT ID, TITLE, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
	for _, id := range groupIDs {
		row := db.QueryRow(groupQuery, id)
		var gr GroupId
		var img sql.NullString

		err := row.Scan(&gr.Id, &gr.Name, &img, &gr.CreatedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				// Groupe supprimé ou inexistant, on ignore
				continue
			}
			return groups, err // autre erreur, on renvoie
		}

		if img.Valid {
			gr.GroupPicUrl = img.String
		}

		groups = append(groups, gr)
	}

	return groups, nil
}
