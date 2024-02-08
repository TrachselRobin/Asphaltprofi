DROP DATABASE IF EXISTS nunapuki_users;
CREATE DATABASE nunapuki_users;

USE nunapuki_users;

CREATE TABLE user (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (userID), 
    `prename` VARCHAR(20) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `age` INTEGER,
    `username` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `aboID` INTEGER NOT NULL,
    `vehicleID` INTEGER,
    `addressID` INTEGER
);

CREATE TABLE abo (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (aboID),
    `name` VARCHAR(20),
    `price` INTEGER
);

CREATE TABLE vehicle (
	`ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (vehicleID),
    `brand` VARCHAR(20),
    `model` VARCHAR(20),
    `image` VARCHAR(100),
    `year` INTEGER,
    `hp` INTEGER,
    `ccm` INTEGER,
    `tagID` INTEGER
);

CREATE TABLE tag (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (tagID),
    `name` VARCHAR(20)
);

CREATE TABLE time (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (timeID),
    `start` DATETIME,
    `end` DATETIME
);

CREATE TABLE user_time (
    `userID` INTEGER, 
    `timeID` INTEGER
);

CREATE TABLE address (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (addressID),
    `street` VARCHAR(40),
    `number` INTEGER,
    `zip` INTEGER
);

ALTER TABLE user AUTO_INCREMENT=1000000000;

ALTER TABLE user ADD FOREIGN KEY (aboID) REFERENCES abo (ID);

ALTER TABLE user ADD FOREIGN KEY (vehicleID) REFERENCES vehicle (ID);

ALTER TABLE vehicle ADD FOREIGN KEY (tagID) REFERENCES tag (ID);

ALTER TABLE user ADD FOREIGN KEY (addressID) REFERENCES address (ID);

ALTER TABLE user_time ADD FOREIGN KEY (userID) REFERENCES user (ID);
ALTER TABLE user_time ADD FOREIGN KEY (timeID) REFERENCES time (ID);



INSERT INTO `abo` * VALUES (1, 'Standard', 0);
INSERT INTO `abo` * VALUES (2, 'Premium', 100);
INSERT INTO `abo` * VALUES (3, 'Premium Advanced', 200);

INSERT INTO `tag` * VALUES (1, 'Stock');
INSERT INTO `tag` * VALUES (2, 'Tuned');
INSERT INTO `tag` * VALUES (3, 'Racing');

INSERT INTO `user` * VALUES (1, 'Max', 'Mustermann', 20, 'maxi', 'max@muster.ch', '1234', 1, 1, 1);

SELECT * FROM `user`;