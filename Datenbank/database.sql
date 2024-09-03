USE nunapuki_users;

DROP TABLE IF EXISTS vehicle_time;
DROP TABLE IF EXISTS user_chat;
DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS user_vehicle;
DROP TABLE IF EXISTS user_friend;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS chat;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS abo;
DROP TABLE IF EXISTS vehicle;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS time;

CREATE TABLE users (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID), 
    `prename` VARCHAR(20) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `birthdate` DATE,
    `username` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `image` VARCHAR(100) NOT NULL,
    `token` VARCHAR(24),
    `tokenCreation` DATETIME,
    `aboID` INTEGER NOT NULL,
    `addressID` INTEGER
);

CREATE TABLE abo (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `name` VARCHAR(20),
    `price` INTEGER
);

CREATE TABLE vehicle (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `brand` VARCHAR(20) NOT NULL,
    `model` VARCHAR(20) NOT NULL,
    `image` VARCHAR(100),
    `year` INTEGER,
    `hp` INTEGER,
    `ccm` INTEGER,
    `tagID` INTEGER
);

CREATE TABLE tag (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `name` VARCHAR(20)
);

CREATE TABLE time (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `start` DATETIME(3),
    `end` DATETIME(3)
);

CREATE TABLE vehicle_time (
    `vehicleID` INTEGER, 
    `timeID` INTEGER
);

CREATE TABLE address (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `street` VARCHAR(40),
    `number` INTEGER,
    `zip` INTEGER,
    `city` VARCHAR(40)
);

CREATE TABLE chat (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `userID` INTEGER,
    `user2ID` INTEGER
);

CREATE TABLE message (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `text` VARCHAR(1000),
    `time` DATETIME,
    `userID` INTEGER
);

CREATE TABLE chat_message (
    `chatID` INTEGER, 
    `messageID` INTEGER
);

CREATE TABLE user_chat (
    `userID` INTEGER, 
    `chatID` INTEGER
);

CREATE TABLE user_vehicle (
    `userID` INTEGER, 
    `vehicleID` INTEGER
);

CREATE TABLE user_friend (
    `userID` INTEGER,
    `friendID` INTEGER
);

ALTER TABLE users AUTO_INCREMENT=1000000000;

ALTER TABLE users ADD FOREIGN KEY (aboID) REFERENCES abo (ID);

ALTER TABLE vehicle ADD FOREIGN KEY (tagID) REFERENCES tag (ID);

ALTER TABLE users ADD FOREIGN KEY (addressID) REFERENCES address (ID);

ALTER TABLE chat ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE chat ADD FOREIGN KEY (user2ID) REFERENCES users (ID);

ALTER TABLE vehicle_time ADD FOREIGN KEY (vehicleID) REFERENCES vehicle (ID);
ALTER TABLE vehicle_time ADD FOREIGN KEY (timeID) REFERENCES time (ID);

ALTER TABLE user_chat ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_chat ADD FOREIGN KEY (chatID) REFERENCES chat (ID);

ALTER TABLE message ADD FOREIGN KEY (userID) REFERENCES users (ID);

ALTER TABLE chat_message ADD FOREIGN KEY (chatID) REFERENCES chat (ID);
ALTER TABLE chat_message ADD FOREIGN KEY (messageID) REFERENCES message (ID);

ALTER TABLE user_vehicle ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_vehicle ADD FOREIGN KEY (vehicleID) REFERENCES vehicle (ID);

ALTER TABLE user_friend ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_friend ADD FOREIGN KEY (friendID) REFERENCES users (ID);



INSERT INTO `abo` (name, price) VALUES ('Standard', 0);
INSERT INTO `abo` (name, price) VALUES ('Premium', 100);
INSERT INTO `abo` (name, price) VALUES ('Premium Advanced', 120);

INSERT INTO `tag` (name) VALUES ('Stock');
INSERT INTO `tag` (name) VALUES ('Modified');
INSERT INTO `tag` (name) VALUES ('Racing only');

INSERT INTO `address` (street, number, zip, city) VALUES ('Musterstrasse', 1, 8000, 'Zürich');
INSERT INTO `address` (street, number, zip, city) VALUES ('Maxistrasse', 2, 8001, 'Zürich');

INSERT INTO `vehicle` (brand, model, image, year, hp, ccm, tagID) VALUES ('BMW', 'M3', './images/2.png', 2019, 431, 2979, 1);
INSERT INTO `vehicle` (brand, model, image, year, hp, ccm, tagID) VALUES ('Audi', 'RS6', './images/1.png' , 2020, 600, 3993, 2);

INSERT INTO `users` (prename, name, birthdate, username, email, password, aboID, addressID, image) VALUES ('Max', 'Mustermann', '1990-01-01', 'maxi', 'max@muster.ch', '1234', 1, 1, '1.png');
INSERT INTO `users` (prename, name, birthdate, username, email, password, aboID, addressID, image) VALUES ('Hans', 'Muster', '1991-01-01', 'hansi', 'hans@muster.ch', '1234', 2, 2, '2.png');

INSERT INTO `user_vehicle` (userID, vehicleID) VALUES (1000000000, 1);
INSERT INTO `user_vehicle` (userID, vehicleID) VALUES (1000000001, 2);

INSERT INTO `time` (start, end) VALUES ('2021-01-01 00:00:00', '2021-01-01 01:00:00');
INSERT INTO `time` (start, end) VALUES ('2021-01-01 01:00:00', '2021-01-01 02:00:00');

INSERT INTO `vehicle_time` (vehicleID, timeID) VALUES (1, 1);
INSERT INTO `vehicle_time` (vehicleID, timeID) VALUES (2, 2);

INSERT INTO `chat` (userID, user2ID) VALUES (1000000000, 1000000001);

INSERT INTO `message` (text, time, userID) VALUES ('Hallo', '2021-01-01 00:00:00', 1000000000);
INSERT INTO `message` (text, time, userID) VALUES ('Hallo', '2021-01-01 00:00:00', 1000000001);

INSERT INTO `chat_message` (chatID, messageID) VALUES (1, 1);
INSERT INTO `chat_message` (chatID, messageID) VALUES (1, 2);

INSERT INTO `user_chat` (userID, chatID) VALUES (1000000000, 1);
INSERT INTO `user_chat` (userID, chatID) VALUES (1000000001, 1);

INSERT INTO `user_friend` (userID, friendID) VALUES (1000000000, 1000000001);
INSERT INTO `user_friend` (userID, friendID) VALUES (1000000001, 1000000000);

SELECT * FROM `users`;