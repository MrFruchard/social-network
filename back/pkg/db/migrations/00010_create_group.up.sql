CREATE TABLE IF NOT EXISTS ALL_GROUPS (
    ID TEXT NOT NULL PRIMARY KEY,
    TITLE TEXT NOT NULL,
    DESC TEXT NOT NULL,
    OWNER TEXT NOT NULL,
    IMAGE TEXT NULL,
    CREATED_AT TEXT NOT NULL,
    FOREIGN KEY (OWNER) REFERENCES USER(ID)
);

INSERT INTO ALL_GROUPS (ID, TITLE, DESC, OWNER, IMAGE, CREATED_AT) VALUES
    ('4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 'Développeurs Golang', 'Un groupe pour discuter de projets, astuces et outils liés à Go.', '909bac18-92a1-4246-85f6-1a8997aa8bb5', 'golang_group.jpg', datetime('now'));