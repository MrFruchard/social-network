CREATE TABLE IF NOT EXISTS REQUEST_FOLLOW (
    ID TEXT NOT NULL PRIMARY KEY UNIQUE,
    RECEIVER_ID TEXT NOT NULL,
    ASKER_ID TEXT NOT NULL,
    STATUS TEXT NOT NULL CHECK ( STATUS IN ('pending','refused','accepted') ),
    CREATED_AT TEXT NOT NULL,
    FOREIGN KEY (RECEIVER_ID) REFERENCES USER(ID),
    FOREIGN KEY (ASKER_ID) REFERENCES USER(ID)
);

INSERT INTO REQUEST_FOLLOW (ID, RECEIVER_ID, ASKER_ID, STATUS, CREATED_AT) VALUES
-- John envoie une demande à Jane (encore en attente)
('rf111111-aaaa-4aaa-bbbb-111111111111', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', '909bac18-92a1-4246-85f6-1a8997aa8bb5', 'pending', datetime('now')),

-- Jane envoie une demande à Alex (acceptée)
('rf222222-bbbb-4bbb-cccc-222222222222', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', 'accepted', datetime('now')),

-- Sarah envoie une demande à John (refusée)
('rf333333-cccc-4ccc-dddd-333333333333', '909bac18-92a1-4246-85f6-1a8997aa8bb5', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', 'refused', datetime('now')),

-- Alex envoie une demande à Sarah (en attente)
('rf444444-dddd-4ddd-eeee-444444444444', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', 'pending', datetime('now'));