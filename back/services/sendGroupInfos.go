package services

import "database/sql"

type GroupInfo struct {
	GroupInfos   GroupInformation `json:"group_infos"`
	TotalMembers int              `json:"total_members"`
	IsMember     bool             `json:"is_member"`
	IsAdmin      bool             `json:"is_admin"`
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

	queryM := `SELECT EXISTS (SELECT 1 FROM GROUPS_MEMBERS WHERE USER_ID = ? AND GROUP_ID = ?)`
	err := db.QueryRow(queryM, userId, groupId).Scan(&g.IsMember)
	if err != nil {
		return g, err
	}

	queryO := `SELECT EXISTS(SELECT 1 FROM ALL_GROUPS WHERE OWNER = ?AND ID = ?)`
	err = db.QueryRow(queryO, userId, groupId).Scan(&g.IsAdmin)
	if err != nil {
		return g, err
	}

	queryTotalMember := `SELECT COUNT(*) FROM GROUPS_MEMBERS WHERE GROUP_ID = ?`
	err = db.QueryRow(queryTotalMember, groupId).Scan(&g.TotalMembers)
	if err != nil {
		return g, err
	}

	var imgGroup sql.NullString
	queryInfo := `SELECT ID, TITLE, DESCRIPTION, IMAGE, CREATED_AT FROM ALL_GROUPS WHERE ID = ?`
	err = db.QueryRow(queryInfo, groupId).Scan(&g.GroupInfos.Id, &g.GroupInfos.Name, &g.GroupInfos.Description, &imgGroup, &g.GroupInfos.CreatedAt)
	if err != nil {
		return g, err
	}

	if imgGroup.Valid {
		g.GroupInfos.GroupPicUrl = imgGroup.String
	}

	return g, nil
}
