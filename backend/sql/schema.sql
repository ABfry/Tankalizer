-- Tankalizerのテーブル定義 (2025/06/18)
-- users
CREATE TABLE tankalizer.users (
id CHAR(36) PRIMARY KEY DEFAULT (UUID()), 
name VARCHAR(20) NOT NULL,
oauth_app ENUM('github', 'google') NOT NULL,
connect_info VARCHAR(100) NOT NULL,
profile_text VARCHAR(255),
icon_url VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

UNIQUE (connect_info),
UNIQUE (icon_url)

);

-- posts
CREATE TABLE tankalizer.posts (
id CHAR(36) PRIMARY KEY DEFAULT (UUID()), 
original VARCHAR(255) NOT NULL,
tanka JSON NOT NULL,
image_path VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
user_id CHAR(36) NOT NULL,
is_deleted BOOL NOT NULL DEFAULT FALSE,

FOREIGN KEY (user_id) REFERENCES users(id)
	ON DELETE CASCADE
	ON UPDATE CASCADE

);

-- miyabis
CREATE TABLE tankalizer.miyabis (
id CHAR(36) PRIMARY KEY DEFAULT (UUID()), 
user_id CHAR(36) NOT NULL,
post_id CHAR(36) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

UNIQUE (user_id, post_id),

FOREIGN KEY (user_id) REFERENCES users(id)
	ON DELETE CASCADE
	ON UPDATE CASCADE,

FOREIGN KEY (post_id) REFERENCES posts(id)
	ON DELETE CASCADE
	ON UPDATE CASCADE
);

-- developers
CREATE TABLE tankalizer.developers (
  user_id CHAR(36) PRIMARY KEY,
  developer_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- follows
CREATE TABLE tankalizer.follows (
  follower_id CHAR(36) NOT NULL,
  followee_id CHAR(36) NOT NULL,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (follower_id, followee_id),

  FOREIGN KEY (follower_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (followee_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);