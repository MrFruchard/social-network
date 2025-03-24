CREATE TABLE IF NOT EXISTS FOLLOWERS (
    ID TEXT NOT NULL PRIMARY KEY,
    USER_ID TEXT NOT NULL,
    FOLLOWERS TEXT NOT NULL,
    CREATED_AT TEXT NOT NULL,
    FOREIGN KEY (USER_ID) REFERENCES USER(ID),
    FOREIGN KEY (FOLLOWERS) REFERENCES USER(ID)
);

INSERT INTO FOLLOWERS (ID, USER_ID, FOLLOWERS, CREATED_AT) VALUES
-- Jane suit Alex (demande acceptée)
('flw11111-aaaa-4aaa-bbbb-111111111111', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', datetime('now'));

-- Optionnel : si tu veux aussi que le suivi soit bidirectionnel pour certains cas :
-- Alex suit Jane (pas explicitement demandé, à ajouter uniquement si logique réciproque)
-- ('flw22222-bbbb-4bbb-cccc-222222222222', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', datetime('now')),