package services

import (
	"database/sql"
	"github.com/pkg/errors"
	"log"
	"strings"
)

func ModifyGroup(db *sql.DB, userID, title, desc, groupID, img string) error {
	var groupTitle, groupDesc, groupOwner string
	var image sql.NullString

	query := `SELECT TITLE, DESC, OWNER, IMAGE FROM ALL_GROUPS WHERE ID = ?`
	err := db.QueryRow(query, groupID).Scan(&groupTitle, &groupDesc, &groupOwner, &image)
	if err != nil {
		return err
	}

	if strings.TrimSpace(img) == "" {
		if image.Valid {
			img = image.String
		} else {
			img = ""
		}
	}

	if groupOwner != userID {
		return errors.New("You are not the owner")
	}

	if strings.TrimSpace(title) == "" {
		title = groupTitle
	}
	if strings.TrimSpace(desc) == "" {
		desc = groupDesc
	}

	// Vérifie si un changement a été réellement effectué
	if title == groupTitle && desc == groupDesc && img == image.String {
		log.Println("Aucun changement détecté, pas de mise à jour nécessaire.")
		return nil
	}

	updateQuery := `UPDATE ALL_GROUPS SET TITLE = ?, DESC = ?, IMAGE = ? WHERE ID = ?`
	_, err = db.Exec(updateQuery, title, desc, img, groupID)
	if err != nil {
		return errors.Wrap(err, "failed to update group")
	}

	log.Printf("Groupe %s modifié par %s\n", groupID, userID)
	return nil
}
