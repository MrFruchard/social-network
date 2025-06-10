package services

import (
	"database/sql"
)

type GroupInfo struct {
	GroupInfos   GroupInformation `json:"group_infos"`
	TotalMembers int              `json:"total_members"`
	IsMember     bool             `json:"is_member"`
	IsAdmin      bool             `json:"is_admin"`
	JoinStatus   int              `json:"join_status"` // 0: pas de demande, 1: demande en cours, 2: membre
}

type GroupInformation struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	GroupPicUrl string `json:"group_pic_url"`
	CreatedAt   string `json:"created_at"`
}

func SendGroupInfos(db *sql.DB, userId, groupId string) (GroupInfo, error) {
	var g GroupInfo

	// Vérifier si l'utilisateur est membre
	queryM := `SELECT EXISTS (SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(queryM, userId, groupId).Scan(&g.IsMember)
	if err != nil {
		return g, err
	}

	// Si membre → statut = 2
	if g.IsMember {
		g.JoinStatus = 2
	} else {
		// Sinon, vérifier dans ASK_GROUP la demande en attente ou non
		var accepted sql.NullInt64
		queryAsk := `
			SELECT ACCEPTED FROM ASK_GROUP
			WHERE ASKER = ? AND GROUP_ID = ?
			ORDER BY CREATED_AT DESC LIMIT 1
		`
		err = db.QueryRow(queryAsk, userId, groupId).Scan(&accepted)
		if err != nil && err != sql.ErrNoRows {
			return g, err
		}

		if accepted.Valid {
			if accepted.Int64 == 1 {
				g.JoinStatus = 2
				g.IsMember = true
			} else {
				g.JoinStatus = 1
			}
		} else {
			g.JoinStatus = 0
		}
	}

	// Vérifier si l'utilisateur est admin
	queryO := `SELECT EXISTS(SELECT 1 FROM ALL_GROUPS WHERE OWNER = ? AND ID = ?)`
	err = db.QueryRow(queryO, userId, groupId).Scan(&g.IsAdmin)
	if err != nil {
		return g, err
	}

	// Nombre total de membres
	queryTotalMember := `SELECT COUNT(*) FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	err = db.QueryRow(queryTotalMember, groupId).Scan(&g.TotalMembers)
	if err != nil {
		return g, err
	}

	// Infos du groupe
	var imgGroup sql.NullString
	queryInfo := `SELECT ID, TITLE, DESCRIPTION, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
	err = db.QueryRow(queryInfo, groupId).Scan(
		&g.GroupInfos.Id,
		&g.GroupInfos.Name,
		&g.GroupInfos.Description,
		&imgGroup,
		&g.GroupInfos.CreatedAt,
	)
	if err != nil {
		return g, err
	}

	if imgGroup.Valid {
		g.GroupInfos.GroupPicUrl = imgGroup.String
	}

	return g, nil
}
