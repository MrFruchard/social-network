package services

import (
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"strings"
)

const (
	PrivacyPrivate = 0
	PrivacyFriends = 1
	PrivacyPublic  = 2
)

func toNullString(value string) sql.NullString {
	return sql.NullString{String: value, Valid: value != ""}
}

func CreatePost(content, userId, image, tag, groupId, privacy string, users []string, db *sql.DB) error {
	fmt.Printf("[CreatePost] Starting post creation - userId: %s, privacy: %s, groupId: %s\n", userId, privacy, groupId)

	id := uuid.New().String()
	fmt.Printf("[CreatePost] Generated Post ID: %s\n", id)

	imageNull := toNullString(image)
	groupIdNull := toNullString(groupId)

	privacyPost := PrivacyFriends
	if privacy == "public" && len(users) == 0 {
		privacyPost = PrivacyPublic
		fmt.Printf("[CreatePost] Privacy set to PUBLIC\n")
	}
	if len(users) > 0 {
		privacyPost = PrivacyPrivate
		fmt.Printf("[CreatePost] Privacy set to PRIVATE, validating %d users...\n", len(users))

		fmt.Printf("[CreatePost] Users list: %v\n", users)
		for _, user := range users {
			var isFollowing bool
			query := `SELECT EXISTS(SELECT 1 FROM FOLLOWERS WHERE FOLLOWERS = ? AND USER_ID = ?)`
			err := db.QueryRow(query, user, userId).Scan(&isFollowing)
			if err != nil {
				fmt.Printf("[CreatePost][ERROR] Failed checking follower status for user %s: %v\n", user, err)
				return err
			}
			if !isFollowing {
				fmt.Printf("[CreatePost][ERROR] User %s is not a follower of %s\n", user, userId)
				return errors.New("One or more users are not your followers")
			}
			fmt.Printf("[CreatePost] User %s is a valid follower\n", user)
		}
	}

	// INSERT dans POSTS
	fmt.Printf("[CreatePost] Inserting POST into database...\n")
	postQuery := `
		INSERT INTO POSTS(ID, CONTENT, USER_ID, CREATED_AT, UPDATED_AT, IMAGE, GROUP_ID, PRIVACY)
		VALUES (?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)
	`
	_, err := db.Exec(postQuery, id, content, userId, imageNull, groupIdNull, privacyPost)
	if err != nil {
		fmt.Printf("[CreatePost][ERROR] Failed inserting POST: %v\n", err)
		return err
	}
	fmt.Printf("[CreatePost] POST inserted successfully.\n")

	// Insertion TAGS
	if strings.TrimSpace(tag) != "" {
		tabTag := strings.Fields(tag)
		fmt.Printf("[CreatePost] Inserting %d TAGS...\n", len(tabTag))
		for _, t := range tabTag {
			tagId := uuid.New().String()
			query := `INSERT INTO TAGS(ID, POST_ID, TAG) VALUES (?,?,?)`
			_, err = db.Exec(query, tagId, id, t)
			if err != nil {
				fmt.Printf("[CreatePost][ERROR] Failed inserting TAG (%s): %v\n", t, err)
				return err
			}
			fmt.Printf("[CreatePost] TAG inserted: %s\n", t)
		}
	}

	// Insertion LIST_PRIVATE_POST
	if privacyPost == PrivacyPrivate {
		fmt.Printf("[CreatePost] Inserting LIST_PRIVATE_POST for %d users...\n", len(users))
		for _, user := range users {
			idPrivate := uuid.New().String()
			privateQuery := `
				INSERT INTO LIST_PRIVATE_POST(ID, POST_ID, USER_ID, CREATED_AT)
				VALUES (?, ?, ?, datetime('now'))
			`
			_, err = db.Exec(privateQuery, idPrivate, id, user)
			if err != nil {
				fmt.Printf("[CreatePost][ERROR] Failed inserting LIST_PRIVATE_POST for user %s: %v\n", user, err)
				return err
			}
			fmt.Printf("[CreatePost] LIST_PRIVATE_POST inserted for user: %s\n", user)
		}
	}

	fmt.Printf("[CreatePost] Post creation completed successfully (PostID: %s)\n", id)
	return nil
}
