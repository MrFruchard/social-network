CREATE TABLE IF NOT EXISTS POST_EVENT (
    ID TEXT NOT NULL PRIMARY KEY,
    POST_ID TEXT NOT NULL,
    USER_ID TEXT NOT NULL,
    LIKED TEXT DEFAULT NULL CHECK (LIKED IN ('liked', 'disliked') OR LIKED IS NULL ),
    CREATED_AT TEXT NOT NULL,
    UPDATE_AT TEXT NULL,
    FOREIGN KEY (POST_ID) REFERENCES POSTS(ID) ON DELETE CASCADE,
    FOREIGN KEY (USER_ID) REFERENCES USER(ID) ON DELETE CASCADE 
);

INSERT INTO POST_EVENT (ID, POST_ID, USER_ID, LIKED, CREATED_AT, UPDATE_AT) VALUES
-- John Doe like le post de Jane Smith
('e111f7d2-a4df-4039-82c0-21bfc5c12001', 'b2e34d67-88e2-4a12-a7c2-79f8169f47b3', '909bac18-92a1-4246-85f6-1a8997aa8bb5', 'liked', datetime('now'), NULL),

-- Jane Smith dislike le post d’Alex Brown
('e222d4e7-13bc-4f62-bbb5-c0e0b9b24102', 'c3a89fe2-c6b5-4c89-928b-3ac6f4f1e1c9', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', 'disliked', datetime('now'), NULL),

-- Sarah Connor like le post de John
('e333c1a9-dadc-4592-937e-0c14fa7b8703', 'a1f55c45-12f4-4f8e-8d2e-1f6c7a1e44ff', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', 'liked', datetime('now'), NULL),

-- Alex Brown like le post de Sarah Connor
('e444aa5b-6f2a-48ea-947e-1dd2f4d88904', 'd4c33b0d-42e1-4d8d-b1c8-5a85cf8d2e78', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'liked', datetime('now'), NULL),

-- Sarah Connor clique mais n'aime pas ni dislike (interaction neutre)
('e555e5e5-5e5e-4e5e-8e5e-5e5e5e5e5e5e', 'c3a89fe2-c6b5-4c89-928b-3ac6f4f1e1c9', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', NULL, datetime('now'), NULL);