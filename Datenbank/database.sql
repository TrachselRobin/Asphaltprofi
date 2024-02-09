DROP DATABASE IF EXISTS nunapuki_users;
CREATE DATABASE nunapuki_users;

USE nunapuki_users;

CREATE TABLE users (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID), 
    `prename` VARCHAR(20) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `age` INTEGER,
    `username` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
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
    `start` DATETIME,
    `end` DATETIME
);

CREATE TABLE user_time (
    `userID` INTEGER, 
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
    `name` VARCHAR(20)
);

CREATE TABLE message (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `text` VARCHAR(100),
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

ALTER TABLE users AUTO_INCREMENT=1000000000;

ALTER TABLE users ADD FOREIGN KEY (aboID) REFERENCES abo (ID);

ALTER TABLE vehicle ADD FOREIGN KEY (tagID) REFERENCES tag (ID);

ALTER TABLE users ADD FOREIGN KEY (addressID) REFERENCES address (ID);

ALTER TABLE user_time ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_time ADD FOREIGN KEY (timeID) REFERENCES time (ID);

ALTER TABLE user_chat ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_chat ADD FOREIGN KEY (chatID) REFERENCES chat (ID);

ALTER TABLE message ADD FOREIGN KEY (userID) REFERENCES users (ID);

ALTER TABLE chat_message ADD FOREIGN KEY (chatID) REFERENCES chat (ID);
ALTER TABLE chat_message ADD FOREIGN KEY (messageID) REFERENCES message (ID);

ALTER TABLE user_vehicle ADD FOREIGN KEY (userID) REFERENCES users (ID);
ALTER TABLE user_vehicle ADD FOREIGN KEY (vehicleID) REFERENCES vehicle (ID);



INSERT INTO `abo` (name, price) VALUES ('Standard', 0);
INSERT INTO `abo` (name, price) VALUES ('Premium', 100);
INSERT INTO `abo` (name, price) VALUES ('Premium Advanced', 120);

INSERT INTO `tag` (name) VALUES ('Stock');
INSERT INTO `tag` (name) VALUES ('Modified');
INSERT INTO `tag` (name) VALUES ('Racing only');

INSERT INTO `address` (street, number, zip, city) VALUES ('Musterstrasse', 1, 8000, 'Zürich');
INSERT INTO `address` (street, number, zip, city) VALUES ('Maxistrasse', 2, 8001, 'Zürich');

INSERT INTO `vehicle` (brand, model, image, year, hp, ccm, tagID) VALUES ('BMW', 'M3', 'https://www.bmw.ch/content/dam/bmw/common/all-models/m-series/m3-sedan/2019/inspire/bmw-m-series-m3-sedan-inspire-01.jpg', 2019, 431, 2979, 1);
INSERT INTO `vehicle` (brand, model, image, year, hp, ccm, tagID) VALUES ('Audi', 'RS6', 'https://www.audi.ch/content/dam/nemo/models/audi-rs6-avant/my-2020/1920x1080-gal-prop-tx/' , 2020, 600, 3993, 2);

INSERT INTO `users` (prename, name, age, username, email, password, aboID, addressID) VALUES ('Max', 'Mustermann', 20, 'maxi', 'max@muster.ch', '1234', 1, 1);
INSERT INTO `users` (prename, name, age, username, email, password, aboID, addressID) VALUES ('Hans', 'Muster', 25, 'hans', 'hans@muster.ch', '1234', 2, 2);

INSERT INTO `user_vehicle` (userID, vehicleID) VALUES (1000000000, 1);
INSERT INTO `user_vehicle` (userID, vehicleID) VALUES (1000000001, 2);

SELECT * FROM `users`;