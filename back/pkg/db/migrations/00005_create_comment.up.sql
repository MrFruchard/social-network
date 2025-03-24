CREATE TABLE IF NOT EXISTS COMMENT (
    ID TEXT NOT NULL UNIQUE PRIMARY KEY,
    POST_ID TEXT NOT NULL,
    USER_ID TEXT NOT NULL,
    CONTENT TEXT NOT NULL,
    IMAGE TEXT NULL ,
    CREATED TEXT NOT NULL,
    UPDATED_AT  TEXT NULL,
    FOREIGN KEY (POST_ID) REFERENCES POSTS(ID) ON DELETE CASCADE ,
    FOREIGN KEY (USER_ID) REFERENCES USER(ID) ON DELETE CASCADE
);

INSERT INTO COMMENT (ID, POST_ID, USER_ID, CONTENT, IMAGE, CREATED, UPDATED_AT) VALUES
-- John commente le post de Sarah
('f1111111-aaaa-4aaa-bbbb-111111111111', 'd4c33b0d-42e1-4d8d-b1c8-5a85cf8d2e78', '909bac18-92a1-4246-85f6-1a8997aa8bb5',
 'Super intéressant, tu pourras partager ton script ?', NULL, datetime('now'), NULL),

-- Jane commente le post d’Alex
('f2222222-bbbb-4bbb-cccc-222222222222', 'c3a89fe2-c6b5-4c89-928b-3ac6f4f1e1c9', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8',
 'Je joue aussi à Elden Ring ! Quel est ton build ?', NULL, datetime('now'), NULL),

-- Alex commente le post de Jane
('f3333333-cccc-4ccc-dddd-333333333333', 'b2e34d67-88e2-4a12-a7c2-79f8169f47b3', '765c0cf9-eb9b-4940-831f-11b3d6b948bf',
 'Hâte de voir le résultat, tu utilises quel outil ?', NULL, datetime('now'), NULL),

-- Sarah commente le post de John
('f4444444-dddd-4ddd-eeee-444444444444', 'a1f55c45-12f4-4f8e-8d2e-1f6c7a1e44ff', '71f8b5d7-3d96-4632-aa62-aa9837b6b042',
 'Bienvenue John ! Tu vas aimer la communauté 😊', 'welcome_sarah_comment.jpg', datetime('now'), NULL);