package services

import (
	"database/sql"
	"strings"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func AddMessage(db *sql.DB, members []string, senderID, conversationID, content string, typeMsg int) (string, string, error) {
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
			return "", "", errors.Wrap(err, "failed to check membership")
		}
		if !isMember {
			return "", "", errors.New("you are not a member of this conversation")
		}

		// Ajoute le message
		msgID := uuid.New().String()
		_, err = db.Exec(`
			INSERT INTO MESSAGES (ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT)
			VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
		`, msgID, senderID, conversationID, content, typeMsg)
		if err != nil {
			return "", "", errors.Wrap(err, "failed to insert message in existing conversation")
		}
		return conversationID, msgID, nil
	}

	// Nettoyage + suppression doublons + validation
	unique := make(map[string]bool)
	for _, userID := range members {
		userID = strings.TrimSpace(userID)
		if userID == "" || userID == senderID || unique[userID] {
			continue
		}
		// Vérifie que l'utilisateur suit l'expéditeur
		var follows bool
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE USER_ID = ? AND FOLLOWERS = ?)
		`, userID, senderID).Scan(&follows)
		if err != nil {
			return "", "", errors.Wrapf(err, "failed to check follow status for user %s", userID)
		}
		if !follows {
			return "", "", errors.Errorf("user %s does not follow you", userID)
		}
		unique[userID] = true
	}

	// Vérifie conversation privée existante (si un seul membre)
	if len(unique) == 1 {
		var otherID string
		for k := range unique {
			otherID = k
			break
		}

		var existingConvID string
		err := db.QueryRow(`
			SELECT cm1.CONVERSATION_ID
			FROM CONVERSATION_MEMBERS cm1
			JOIN CONVERSATION_MEMBERS cm2 ON cm1.CONVERSATION_ID = cm2.CONVERSATION_ID
			JOIN (
				SELECT CONVERSATION_ID
				FROM CONVERSATION_MEMBERS
				GROUP BY CONVERSATION_ID
				HAVING COUNT(*) = 2
			) filtered ON cm1.CONVERSATION_ID = filtered.CONVERSATION_ID
			WHERE cm1.USER_ID = ? AND cm2.USER_ID = ?
			LIMIT 1
		`, senderID, otherID).Scan(&existingConvID)

		if err != nil && err != sql.ErrNoRows {
			return "", "", errors.Wrap(err, "failed to check existing private conversation")
		}

		if existingConvID != "" {
			// Ajoute le message à la conversation existante
			msgID := uuid.New().String()
			_, err = db.Exec(`
				INSERT INTO MESSAGES (ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT)
				VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
			`, msgID, senderID, existingConvID, content, typeMsg)
			if err != nil {
				return "", "", errors.Wrap(err, "failed to insert message in existing private conversation")
			}
			return existingConvID, msgID, nil
		}
	}

	// Crée une nouvelle conversation
	convID := uuid.New().String()
	isGroup := 0
	if len(unique) > 1 {
		isGroup = 1
	}

	_, err := db.Exec(`
		INSERT INTO CONVERSATIONS (ID, IS_GROUP, CREATED_AT)
		VALUES (?, ?, datetime('now'))
	`, convID, isGroup)
	if err != nil {
		return "", "", errors.Wrap(err, "failed to create conversation")
	}

	// Ajoute les membres + sender
	unique[senderID] = true
	for userID := range unique {
		_, err = db.Exec(`
			INSERT INTO CONVERSATION_MEMBERS (CONVERSATION_ID, USER_ID)
			VALUES (?, ?)
		`, convID, userID)
		if err != nil {
			return "", "", errors.Wrapf(err, "failed to add user %s to conversation", userID)
		}
	}

	// Ajoute le message
	msgID := uuid.New().String()
	_, err = db.Exec(`
		INSERT INTO MESSAGES (ID, SENDER_ID, CONVERSATION_ID, CONTENT, SEEN, TYPE, CREATED_AT)
		VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
	`, msgID, senderID, convID, content, typeMsg)
	if err != nil {
		return "", "", errors.Wrap(err, "failed to insert message")
	}

	return convID, "", nil
}
