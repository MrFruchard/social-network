package sqlite

import (
	"database/sql"
	"errors"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

func StartMigration() {
	m, err := migrate.New(
		"file://pkg/db/migrations/",
		"sqlite://pkg/db/database.db")
	if err != nil {
		log.Fatalf("Erreur de migrations fichiers : %v", err)
	}

	// Execute les migrations en d
	// Execute les migrations en up
	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatalf("Erreur lors de l'application des migrations: %v", err)
	}
}

func OpenDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "pkg/db/database.db")
	if err != nil {
		return nil, err
	}
	return db, nil
}
