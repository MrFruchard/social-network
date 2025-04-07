CREATE TABLE IF NOT EXISTS COMMENT_EVENT (
    ID TEXT NOT NULL PRIMARY KEY,
    COMMENT_ID TEXT NOT NULL,
    USER_ID TEXT NOT NULL,
    LIKED TEXT DEFAULT NULL CHECK (LIKED IN ('liked', 'disliked') OR LIKED IS NULL ),
    CREATED_AT TEXT NOT NULL,
    UPDATE_AT TEXT NULL,
    FOREIGN KEY (USER_ID) REFERENCES USER(ID),
    FOREIGN KEY (COMMENT_ID) REFERENCES COMMENT(ID)
);


INSERT INTO COMMENT_EVENT (ID, COMMENT_ID, USER_ID, LIKED, CREATED_AT, UPDATE_AT) VALUES
-- Jane like le commentaire de John sur le post de Sarah
('ce111111-a1a1-4b1b-c1c1-deadbeef0001', 'f1111111-aaaa-4aaa-bbbb-111111111111', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', 'liked', datetime('now'), NULL),

-- Alex dislike le commentaire de Jane sur son post
('ce222222-b2b2-4c2c-d2d2-deadbeef0002', 'f2222222-bbbb-4bbb-cccc-222222222222', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'disliked', datetime('now'), NULL),

-- Sarah like le commentaire d’Alex sur le post de Jane
('ce333333-c3c3-4d3d-e3e3-deadbeef0003', 'f3333333-cccc-4ccc-dddd-333333333333', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', 'liked', datetime('now'), NULL),

-- John laisse une interaction neutre (pas de like ni dislike) sur le commentaire de Sarah
('ce444444-d4d4-4e4e-f4f4-deadbeef0004', 'f4444444-dddd-4ddd-eeee-444444444444', '909bac18-92a1-4246-85f6-1a8997aa8bb5', NULL, datetime('now'), NULL);