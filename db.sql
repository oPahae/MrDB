DROP DATABASE IF EXISTS mrdb;
CREATE DATABASE mrdb;
USE mrdb;

CREATE TABLE series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    otherTitle VARCHAR(255) DEFAULT NULL,
    img VARCHAR(500),
    trailer VARCHAR(500) DEFAULT NULL,
    descr TEXT,
    finished BOOLEAN DEFAULT TRUE,
    type ENUM('anime', 'series', 'kdrama', 'other') NOT NULL DEFAULT 'other',
    start DATE,
    end DATE,
    maker VARCHAR(255),
    rating DECIMAL(3,1) DEFAULT 0
);

CREATE TABLE seasons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serieID INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    number INT DEFAULT 0,
    FOREIGN KEY (serieID) REFERENCES series(id) ON DELETE CASCADE
);

CREATE TABLE episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seasonID INT NOT NULL,
    number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    img VARCHAR(500),
    rating DECIMAL(3,1) DEFAULT 0,
    FOREIGN KEY (seasonID) REFERENCES seasons(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE ratingep (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    episodeID INT NOT NULL,
    rating TEXT DEFAULT 5,
    feedback TEXT DEFAULT NULL,
    FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (episodeID) REFERENCES episodes(id) ON DELETE CASCADE,
    UNIQUE (userID, episodeID)
);

-- CREATE TABLE ratingSR (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     userID INT NOT NULL,
--     seriesID INT NOT NULL,
--     rating TEXT DEFAULT 5,
--     feedback TEXT DEFAULT NULL,
--     FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (seriesID) REFERENCES series(id) ON DELETE CASCADE,
--     UNIQUE (userID, seriesID)
-- );

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    seriesID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seriesID) REFERENCES series(id) ON DELETE CASCADE,
    UNIQUE (userID, seriesID)
);