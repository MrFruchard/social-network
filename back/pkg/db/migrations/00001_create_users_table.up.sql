CREATE TABLE IF NOT EXISTS USER (
    ID TEXT NOT NULL PRIMARY KEY UNIQUE,
    EMAIL TEXT NOT NULL UNIQUE,
    PASSWORD TEXT NOT NULL,
    FIRSTNAME TEXT NOT NULL,
    LASTNAME TEXT NOT NULL,
    DATE_OF_BIRTH TEXT NOT NULL,
    IMAGE TEXT NULL UNIQUE,
    USERNAME TEXT NULL UNIQUE,
    ABOUT_ME TEXT NULL,
    PUBLIC INTEGER DEFAULT 0,
    ROLE TEXT DEFAULT 'USER',
    CREATED_AT TEXT NOT NULL
);

INSERT INTO USER (ID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME, DATE_OF_BIRTH, IMAGE, USERNAME, ABOUT_ME, PUBLIC, CREATED_AT) VALUES
('909bac18-92a1-4246-85f6-1a8997aa8bb5', 'john.doe@example.com', '$2a$10$1J79RxgxOumzIlUM0DQwPOU4TBwZABuknKAuvcyM6LjMZ8JwAvZDO', 'John', 'Doe', '1990-05-15', 'john.jpg', 'johndoe', 'Développeur passionné par le backend.', 1, datetime('now')),
('de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', 'jane.smith@example.com', '$2a$10$1J79RxgxOumzIlUM0DQwPOU4TBwZABuknKAuvcyM6LjMZ8JwAvZDO', 'Jane', 'Smith', '1992-08-22', 'jane.jpg', 'janesmith', 'Fan de design et UI/UX.', 0, datetime('now')),
('765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'alex.brown@example.com', '$2a$10$1J79RxgxOumzIlUM0DQwPOU4TBwZABuknKAuvcyM6LjMZ8JwAvZDO', 'Alex', 'Brown', '1988-12-03', NULL, 'alexbrown', 'Aime les jeux vidéo et le DevOps.', 1, datetime('now')),
('71f8b5d7-3d96-4632-aa62-aa9837b6b042', 'sarah.connor@example.com', '$2a$10$1J79RxgxOumzIlUM0DQwPOU4TBwZABuknKAuvcyM6LjMZ8JwAvZDO', 'Sarah', 'Connor', '1995-06-30', 'sarah.jpg', 'sconnor', 'Passionnée par l’IA et la cybersécurité.', 1, datetime('now'));