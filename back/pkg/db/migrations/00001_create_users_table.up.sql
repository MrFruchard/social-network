CREATE TABLE IF NOT EXISTS USER (
    ID TEXT NOT NULL PRIMARY KEY,
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
('1', 'john.doe@example.com', 'hashedpassword1', 'John', 'Doe', '1990-05-15', 'john.jpg', 'johndoe', 'Développeur passionné par le backend.', 1, datetime('now')),
('2', 'jane.smith@example.com', 'hashedpassword2', 'Jane', 'Smith', '1992-08-22', 'jane.jpg', 'janesmith', 'Fan de design et UI/UX.', 0, datetime('now')),
('3', 'alex.brown@example.com', 'hashedpassword3', 'Alex', 'Brown', '1988-12-03', NULL, 'alexbrown', 'Aime les jeux vidéo et le DevOps.', 1, datetime('now')),
('4', 'sarah.connor@example.com', 'hashedpassword4', 'Sarah', 'Connor', '1995-06-30', 'sarah.jpg', 'sconnor', 'Passionnée par l’IA et la cybersécurité.', 1, datetime('now'));