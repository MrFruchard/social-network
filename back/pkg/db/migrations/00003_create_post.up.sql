CREATE TABLE IF NOT EXISTS POSTS (
    ID TEXT NOT NULL PRIMARY KEY,
    CONTENT TEXT NOT NULL,
    USER_ID TEXT NOT NULL ,
    CREATED_AT TEXT NOT NULL,
    UPDATED_AT TEXT NULL,
    IMAGE TEXT NULL UNIQUE,
    TAG TEXT NULL,
    GROUP_ID TEXT NULL,
    PRIVACY INT DEFAULT 1, -- 0 PRIVÉ / 1 SEMI-PRIVÉE / 2 PUBLIC / FAUT CREE UNE TABLE POUR STOCKER LES UTILISATEURS PRIVÉ
    FOREIGN KEY (USER_ID) REFERENCES USER(ID)
);

INSERT INTO POSTS (ID, CONTENT, USER_ID, CREATED_AT, UPDATED_AT, IMAGE, TAG, GROUP_ID, PRIVACY) VALUES
('a1f55c45-12f4-4f8e-8d2e-1f6c7a1e44ff', 'Voici mon premier post sur la plateforme, ravi d’être ici !', '909bac18-92a1-4246-85f6-1a8997aa8bb5', datetime('now'), NULL, 'poxst_john_1.jpg', 'introduction', '4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 2),
('b2e34d67-88e2-4a12-a7c2-79f8169f47b3', 'Je travaille actuellement sur un nouveau design, hâte de le partager !', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', datetime('now'), NULL, 'designx_jane.jpg', 'UI/UX', NULL, 1),
('c3a89fe2-c6b5-4c89-928b-3ac6f4f1e1c9', 'Quelqu’un ici joue à Elden Ring ? Cherche des gens pour coop !', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', datetime('now'), NULL, NULL, 'jeux vidéo', NULL, 2),
('d4c33b0d-42e1-4d8d-b1c8-5a85cf8d2e78', 'Je teste un nouveau script de défense contre les attaques DDoS 🔐', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', datetime('now'), NULL, 'cyber_sarahx.jpg', 'cybersécurité', '4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 1),
('a1f55c45-12f4-4f8e-ed2e-1f6c7a1e44ff', 'Voici mon premier post sur la plateforme, ravi d’être ici !', '909bac18-92a1-4246-85f6-1a8997aa8bb5', datetime('now'), NULL, 'post_john_x1.jpg', 'introduction', NULL, 2),
('b2e34d67-88e2-4a12-q7c2-79f8169f47b3', 'Je travaille actuellement sur un nouveau design, hâte de le partager !', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', datetime('now'), NULL, 'design_jaxne.jpg', 'UI/UX', '4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 1),
('c3a89fe2-c6b5-4c89-a28b-3ac6f4f1e1c9', 'Quelqu’un ici joue à Elden Ring ? Cherche des gens pour coop !', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', datetime('now'), NULL, NULL, 'jeux vidéo', NULL, 2),
('d4c33b0d-42e1-4d8d-b1j8-5a85cf8d2e78', 'Je teste un nouveau script de défense contre les attaques DDoS 🔐', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', datetime('now'), NULL, 'cybxer_sarah.jpg', 'cybersécurité', '4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 1),
('a1f55c45-12f4-4f8e-8dbe-1f6c7a1e44ff', 'Voici mon premier post sur la plateforme, ravi d’être ici !', '909bac18-92a1-4246-85f6-1a8997aa8bb5', datetime('now'), NULL, 'post_johnd_1.jpg', 'introduction', NULL, 2),
('b2e34d67-88e2-4a12-a7cc2-79f8169f47b3', 'Je travaille actuellement sur un nouveau design, hâte de le partager !', 'de9b7d7f-8a2d-4d6f-aaee-142f87a597c8', datetime('now'), NULL, 'desxign_jaxne.jpg', 'UI/UX', '4e2a7d9f-3bcd-4a58-9ef3-0e7c12f7a8d1', 1),
('c3a89fe2-c6b5-4c89-928sb-3ac6f4f1e1c9', 'Quelqu’un ici joue à Elden Ring ? Cherche des gens pour coop !', '765c0cf9-eb9b-4940-831f-11b3d6b948bf', datetime('now'), NULL, NULL, 'jeux vidéo', NULL, 2),
('d4c33b0d-42e1-4d8d-b1zc8-5a85cf8d2e78', 'Je teste un nouveau script de défense contre les attaques DDoS 🔐', '71f8b5d7-3d96-4632-aa62-aa9837b6b042', datetime('now'), NULL, 'cyber_sxarah.jpg', 'cybersécurité', NULL, 1);