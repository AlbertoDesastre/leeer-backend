-- Si ya existen las tablas se borran. Muy importante respetar el orden porque muchas tablas tienen dependencias.
DROP TABLE IF EXISTS creation_collaborations;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS creations;
DROP TABLE IF EXISTS users;


-- USUARIOS y tablas intermedias
CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY,
  nickname VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  profile_picture TEXT,
  description TINYTEXT,
  password TEXT NOT NULL
);


-- CREACIONES, GÉNEROS, ETIQUETAS y demás
CREATE TABLE creations (
  creation_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(60) NOT NULL,
  is_draft BOOLEAN DEFAULT NULL,
  synopsis TINYTEXT,
  description TEXT,
  thumbnail TEXT,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE);

CREATE TABLE creation_collaborations (
  creation_collaboration_id VARCHAR(36) PRIMARY KEY,
  creation_id           VARCHAR(36) NOT NULL,
  user_id               VARCHAR(36) NOT NULL,
  approved_by_original_author BOOLEAN DEFAULT NULL,
  is_fanfiction         BOOLEAN,
  is_spin_off           BOOLEAN,
  is_canon              BOOLEAN,
  creation_date         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modification_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
 FOREIGN KEY (creation_id ) REFERENCES creations(creation_id ) ON DELETE CASCADE
);



-- PARTES y todas las tablas intermedias que se conectan con ella
CREATE TABLE parts (
  part_id VARCHAR(36) PRIMARY KEY NOT NULL,
  creation_id VARCHAR(36)  NOT NULL,
  user_id VARCHAR(36),
  title VARCHAR(100) NOT NULL,
  content MEDIUMTEXT,
  word_count INT,
  reading_time TINYINT,
  thumbnail TEXT,
  is_draft BOOLEAN,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (creation_id) REFERENCES creations(creation_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)  ON DELETE SET NULL
);
