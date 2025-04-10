package services

import (
	"database/sql"
	"strings"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AddMessage(db *sql.DB, members []string, senderID, conversationID, content string, typeMsg int) (string, error) {
	if conversationID != "" {
		// Vérifie que le sender est bien membre de la conversation
		var isMember bool
		err := db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM CONVERSATION_MEMBERS 
				WHERE CONVERSATION_ID = ? AND USER_ID = ?
			)
		`, conversationID, senderID).Scan(&isMember)

		if err != nil {
			return "", errors.Wrap(err, "failed to check membership")
		}
		if !isMember {
			return "", errors.New("you are not a member of this conversation")
		}

		// Ajoute le message
		msgID := uuid.New().String()
		_, err = db.Exec(`
			INSERT INTO MESSAGES (ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT)
			VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
		`, msgID, senderID, conversationID, content, typeMsg)
		if err != nil {
			return "", errors.Wrap(err, "failed to insert message in existing conversation")
		}
		return conversationID, nil
	}

	// Sinon, logique de création de nouvelle conversation
	unique := make(map[string]bool)
	for _, userId := range members {
		userId = strings.TrimSpace(userId)
		if userId == "" || userId == senderID || unique[userId] {
			continue
		}
		unique[userId] = true

		//  Vérifie que le membre suit l'expéditeur
		var follows bool
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)
		`, userId, senderID).Scan(&follows)

		if err != nil {
			return "", errors.Wrapf(err, "failed to check follow status for user %s", userId)
		}
		if !follows {
			return "", errors.Errorf("user %s does not follow you", userId)
		}
	}

	// 1. Créer la conversation
	convID := uuid.New().String()
	_, err := db.Exec(`
		INSERT INTO CONVERSATIONS (ID, IS_GROUP, CREATED_AT)
		VALUES (?, 1, datetime('now'))
	`, convID)
	if err != nil {
		return "", errors.Wrap(err, "failed to create conversation")
	}

	// 2. Ajouter tous les membres + sender
	unique[senderID] = true
	for userid := range unique {
		_, err = db.Exec(`
			INSERT INTO CONVERSATION_MEMBERS (CONVERSATION_ID, USER_ID)
			VALUES (?, ?)
		`, convID, userid)
		if err != nil {
			return "", errors.Wrapf(err, "failed to add user %s to conversation", userid)
		}
	}

	// 3. Ajouter le message
	msgID := uuid.New().String()
	_, err = db.Exec(`
		INSERT INTO MESSAGES (ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT)
		VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
	`, msgID, senderID, convID, content, typeMsg)
	if err != nil {
		return "", errors.Wrap(err, "failed to insert message")
	}

	return convID, nil
}
