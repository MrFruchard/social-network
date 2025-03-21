CREATE TABLE IF NOT EXISTS POSTS (
    ID TEXT NOT NULL PRIMARY KEY,
    CONTENT TEXT NOT NULL,
    USER_ID TEXT NOT NULL ,
    CREATED_AT TEXT NOT NULL,
    UPDATED_AT TEXT NULL,
    IMAGE TEXT NULL UNIQUE,
    TAG TEXT NULL,
    GROUP_ID TEXT NULL,
    FOREIGN KEY (USER_ID) REFERENCES USER(ID)
);