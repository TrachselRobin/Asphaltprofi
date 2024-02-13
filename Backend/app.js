const express = require('express');
const APP = express();
const MYSQL = require('mysql');

const PORT = process.env.PORT || 3000;

const credentials = require('./credentials.json');

APP.use(express.json());

APP.get('/', async (req, res) => {
    const TOKEN = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.send(TOKEN + " " + TOKEN.length);
    log(req, res, "SUCCESS");
});

APP.get('/users', async (req, res) => {
    const SQL = 'SELECT * FROM users';
    
    const RESULT = await sqlQuery(SQL);
    res.send(RESULT);

    log(req, res, "SUCCESS");
});

APP.get('/user/:id', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM users WHERE ID = ${USERID}`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

APP.post('/user', async (req, res) => {
    const BODY = req.body;
    const USER = {prename: BODY.prename, name: BODY.name, birthdate: BODY.birthdate, username: BODY.username, email: BODY.email, password: BODY.password, aboID: BODY.aboID};
    const ADDRESS = {street: BODY.street, city: BODY.city, zip: BODY.zip, number: BODY.number};
    
    // check if user email exists
    let result = await userEmailExists(USER.email);
    if (result) {
        res.status(409).send("Email already exists");
        log(req, res, "ERROR");
        return;
    }

    // check if user username exists
    result = await userUsernameExists(USER.username);
    if (result) {
        res.status(409).send("Username already exists");
        log(req, res, "ERROR");
        return;
    }

    if (!await addressAlreadyExists(ADDRESS)) {
        sql = `INSERT INTO address (street, city, zip, number) VALUES ("${ADDRESS.street}", "${ADDRESS.city}", ${ADDRESS.zip}, ${ADDRESS.number})`;
        result = await sqlQuery(sql);
    }
    
    sql = `INSERT INTO users (prename, name, birthdate, username, email, password, aboID, addressID) VALUES ('${USER.prename}', '${USER.name}', '${USER.birthdate}', '${USER.username}', '${USER.email}', '${USER.password}', ${USER.aboID}, (SELECT ID FROM address WHERE street = '${ADDRESS.street}' AND number = ${ADDRESS.number} AND zip = ${ADDRESS.zip} AND city = '${ADDRESS.city}'))`;
    result = await sqlQuery(sql);

    res.send("User added");
    
    log(req, res, "SUCCESS");
});

APP.put('/user/:id', async (req, res) => {
    const BODY = req.body;
    const USEROLD = await getUser(req.params.id);
    const USER = {prename: BODY.prename, name: BODY.name, birthdate: BODY.birthdate, username: BODY.username, email: BODY.email, password: BODY.password};
    const ADDRESS = {street: BODY.street, city: BODY.city, zip: BODY.zip, number: BODY.number, addressID: undefined};
    
    // check if user id exists
    let result = await userIdExists(req.params.id);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if user email exists
    result = await userEmailExists(USER.email, USEROLD.email);
    if (result) {
        res.status(409).send("Email already exists");
        log(req, res, "ERROR");
        return;
    }

    // check if user username exists
    result = await userUsernameExists(USER.username, USEROLD.username);
    if (result) {
        res.status(409).send("Username already exists");
        log(req, res, "ERROR");
        return;
    }

    /*
    if address already exists, get the addressID
    else insert the address and get the addressID
    */
    if (await addressAlreadyExists(ADDRESS)) {
        sql = `SELECT ID FROM address WHERE street = '${ADDRESS.street}' AND number = ${ADDRESS.number} AND zip = ${ADDRESS.zip} AND city = '${ADDRESS.city}'`;
        result = await sqlQuery(sql);
        ADDRESS.addressID = result[0].ID;
    } else {
        sql = `INSERT INTO address (street, city, zip, number) VALUES ("${ADDRESS.street}", "${ADDRESS.city}", ${ADDRESS.zip}, ${ADDRESS.number})`;
        result = await sqlQuery(sql);
        ADDRESS.addressID = result.insertId;
    }

    sql = `UPDATE users SET prename = '${USER.prename}', name = '${USER.name}', birthdate = '${USER.birthdate}', username = '${USER.username}', email = '${USER.email}', password = '${USER.password}', addressID = ${ADDRESS.addressID} WHERE ID = ${req.params.id}`;
    result = await sqlQuery(sql);

    res.send("User updated");
    
    log(req, res, "SUCCESS");
});

APP.delete('/user/:id', async (req, res) => {
    const USERID = req.params.id;
    const USER = await getUser(USERID);
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }
    
    usedAddresses = await addressInUse(USER.addressID);

    const SQL = `DELETE FROM users WHERE ID = ${USERID}`;
    result = await sqlQuery(SQL);
    res.send("User deleted");

    // if address is only used by this user, delete it
    if (usedAddresses === 1) {
        const SQL = `DELETE FROM address WHERE ID = ${USER.addressID}`;
        result = await sqlQuery(SQL);
    }

    log(req, res, "SUCCESS");
});

APP.post('/user/:id/car', async (req, res) => {
    const USERID = req.params.id;
    const BODY = req.body;
    const CAR = {brand: BODY.brand, model: BODY.model, image: BODY.image, year: BODY.year, hp: BODY.hp, ccm: BODY.ccm, tagID: BODY.tagID};
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO vehicle (brand, model, image, year, hp, ccm, tagID) VALUES ('${CAR.brand}', '${CAR.model}', '${CAR.image}', ${CAR.year}, ${CAR.hp}, ${CAR.ccm}, ${CAR.tagID})`;
    result = await sqlQuery(sql);
    const CARID = result.insertId;

    sql = `INSERT INTO user_vehicle (userID, vehicleID) VALUES (${USERID}, ${CARID})`;
    result = await sqlQuery(sql);

    res.send("Car added");

    log(req, res, "SUCCESS");
});

// get cars of user
APP.get('/user/:id/cars', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM vehicle WHERE ID IN (SELECT vehicleID FROM user_vehicle WHERE userID = ${USERID})`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// delete car of user
APP.delete('/user/:id/car/:carID', async (req, res) => {
    const USERID = req.params.id;
    const CARID = req.params.carID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if car id exists
    result = await userCarExists(USERID, CARID);
    if (!result) {
        res.status(404).send("Car not found");
        log(req, res, "ERROR");
        return;
    }

    let sql = `DELETE FROM user_vehicle WHERE userID = ${USERID} AND vehicleID = ${CARID}`;
    result = await sqlQuery(sql);

    sql = `DELETE FROM vehicle WHERE ID = ${CARID}`;
    result = await sqlQuery(sql);
    res.send("Car deleted");

    log(req, res, "SUCCESS");
});

// update car of user
APP.put('/user/:id/car/:carID', async (req, res) => {
    const USERID = req.params.id;
    const CARID = req.params.carID;
    const BODY = req.body;
    const CAR = {brand: BODY.brand, model: BODY.model, image: BODY.image, year: BODY.year, hp: BODY.hp, ccm: BODY.ccm, tagID: BODY.tagID};
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if car id exists
    result = await userCarExists(USERID, CARID);
    if (!result) {
        res.status(404).send("Car not found");
        log(req, res, "ERROR");
        return;
    }

    let sql = `UPDATE vehicle SET brand = '${CAR.brand}', model = '${CAR.model}', image = '${CAR.image}', year = ${CAR.year}, hp = ${CAR.hp}, ccm = ${CAR.ccm}, tagID = ${CAR.tagID} WHERE ID = ${CARID}`;
    result = await sqlQuery(sql);
    res.send("Car updated");

    log(req, res, "SUCCESS");
});

APP.post('/login', async (req, res) => {
    const BODY = req.body;
    const USER = {email: BODY.email, password: BODY.password};
    
    // check if user email exists
    let result = await userEmailExists(USER.email);
    if (!result) {
        res.status(404).send("E-Mail not found");
        log(req, res, "ERROR");
        return;
    }

    // check if user password is correct
    let sql = `SELECT * FROM users WHERE email = '${USER.email}' AND password = '${USER.password}'`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(401).send("Wrong password");
        log(req, res, "ERROR");
        return;
    }

    // check if user is already logged in
    sql = `SELECT token FROM users WHERE email = '${USER.email}' AND password = '${USER.password}' AND token IS NOT NULL`;
    result = await sqlQuery(sql);
    if (result.length !== 0) {
        res.status(409).send("User already logged in");
        log(req, res, "ERROR");
        return;
    }

    const TOKEN = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // update token and tokenCreation to current time
    sql = `UPDATE users SET token = '${TOKEN}', tokenCreation = NOW() WHERE email = '${USER.email}' AND password = '${USER.password}'`;
    result = await sqlQuery(sql);

    res.send(TOKEN);

    log(req, res, "SUCCESS");
});

// verify token
APP.get('/verify/:id', async (req, res) => {
    const TOKEN = req.params.id;
    if (TOKEN === undefined) {
        res.status(401).send("Not logged in");
        log(req, res, "ERROR");
        return;
    }

    let sql = `SELECT * FROM users WHERE token = '${TOKEN}'`;
    let result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(401).send("Not logged in");
        log(req, res, "ERROR");
        return;
    }

    // if token is older than 30 minutes, delete it
    sql = `SELECT tokenCreation FROM users WHERE token = '${TOKEN}'`;
    const TOKENCREATION = await sqlQuery(sql);
    if (TOKENCREATION[0].tokenCreation < new Date(Date.now() - 30*60*1000)) {
        sql = `UPDATE users SET token = NULL WHERE token = '${TOKEN}'`;
        result = await sqlQuery(sql);
        res.status(401).send("Token expired");
        log(req, res, "ERROR");
        return;
    } else {
        // refresh tokenCreation
        sql = `UPDATE users SET tokenCreation = NOW() WHERE token = '${TOKEN}'`;
        result = await sqlQuery(sql);
    }

    res.send("Logged in");

    log(req, res, "SUCCESS");
});

// logout
APP.delete('/logout', async (req, res) => {
    const TOKEN = req.body.token;
    if (TOKEN === undefined) {
        res.status(401).send("Not logged in");
        log(req, res, "ERROR");
        return;
    }

    // check if token exists
    let sql = `SELECT * FROM users WHERE token = '${TOKEN}'`;
    let result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(401).send("Token not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `UPDATE users SET token = NULL WHERE token = '${TOKEN}'`;
    result = await sqlQuery(sql);
    res.send("Logged out");

    log(req, res, "SUCCESS");
});

// add friend
APP.post('/user/:id/friend', async (req, res) => {
    const USERID = req.params.id;
    const FRIENDID = req.body.friendID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if friend id exists
    result = await userIdExists(FRIENDID);
    if (!result) {
        res.status(404).send("Friend not found");
        log(req, res, "ERROR");
        return;
    }

    // check if friend is already a friend
    let sql = `SELECT * FROM user_friend WHERE userID = ${USERID} AND friendID = ${FRIENDID}`;
    result = await sqlQuery(sql);
    if (result.length !== 0) {
        res.status(409).send("Friend already added");
        log(req, res, "ERROR");
        return;
    }

    // check if friend id is the same as user id
    if (USERID == FRIENDID) {
        res.status(409).send("Cannot add yourself as friend");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO user_friend (userID, friendID) VALUES (${USERID}, ${FRIENDID})`;
    result = await sqlQuery(sql);
    res.send("Friend added");

    log(req, res, "SUCCESS");
});

// delete friend
APP.delete('/user/:id/friend', async (req, res) => {
    const USERID = req.params.id;
    const FRIENDID = req.body.friendID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if friend id exists
    result = await userIdExists(FRIENDID);
    if (!result) {
        res.status(404).send("Friend not found");
        log(req, res, "ERROR");
        return;
    }

    // check if friend is already a friend
    let sql = `SELECT * FROM user_friend WHERE userID = ${USERID} AND friendID = ${FRIENDID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("Friend not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `DELETE FROM user_friend WHERE userID = ${USERID} AND friendID = ${FRIENDID}`;
    result = await sqlQuery(sql);
    res.send("Friend deleted");

    log(req, res, "SUCCESS");
});

// get friends
APP.get('/user/:id/friends', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM users WHERE ID IN (SELECT friendID FROM user_friend WHERE userID = ${USERID})`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// add time
APP.post('/user/:id/time', async (req, res) => {
    const USERID = req.params.id;
    const BODY = req.body;
    const TIME = {start: BODY.start, end: BODY.end};
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO time (start, end) VALUES ('${TIME.start}', '${TIME.end}')`;
    result = await sqlQuery(sql);
    const TIMEID = result.insertId;

    sql = `INSERT INTO user_time (userID, timeID) VALUES (${USERID}, ${TIMEID})`;
    result = await sqlQuery(sql);
    res.send("Time added");

    log(req, res, "SUCCESS");
});

// get times of user
APP.get('/user/:id/times', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM time WHERE ID IN (SELECT timeID FROM user_time WHERE userID = ${USERID})`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// delete time of user
APP.delete('/user/:id/time', async (req, res) => {
    const USERID = req.params.id;
    const TIMEID = req.body.timeID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if time id exists
    let sql = `SELECT * FROM user_time WHERE userID = ${USERID} AND timeID = ${TIMEID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("Time not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `DELETE FROM user_time WHERE userID = ${USERID} AND timeID = ${TIMEID}`;
    result = await sqlQuery(sql);

    sql = `DELETE FROM time WHERE ID = ${TIMEID}`;
    result = await sqlQuery(sql);
    res.send("Time deleted");

    log(req, res, "SUCCESS");
});

// create chat with a friend
/*
CREATE TABLE chat (
    `ID` INTEGER AUTO_INCREMENT, PRIMARY KEY (ID),
    `userID` INTEGER,
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
*/
APP.post('/user/:id/chat', async (req, res) => {
    const USERID = req.params.id;
    const BODY = req.body;
    const CHAT = {name: BODY.name, friendID: BODY.friendID};
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }
    
    // check if friend id exists
    result = await userIdExists(CHAT.friendID);
    if (!result) {
        res.status(404).send("Friend not found");
        log(req, res, "ERROR");
        return;
    }

    // check if chat already exists
    let sql = `SELECT * FROM chat WHERE userID = ${USERID} AND name = '${CHAT.name}'`;
    result = await sqlQuery(sql);
    if (result.length !== 0) {
        res.status(409).send("Chat already exists");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO chat (userID, name) VALUES (${USERID}, '${CHAT.name}')`;
    result = await sqlQuery(sql);
    const CHATID = result.insertId;

    sql = `INSERT INTO user_chat (userID, chatID) VALUES (${USERID}, ${CHATID})`;
    result = await sqlQuery(sql);

    sql = `INSERT INTO user_chat (userID, chatID) VALUES (${CHAT.friendID}, ${CHATID})`;
    result = await sqlQuery(sql);
    res.send("Chat created");

    log(req, res, "SUCCESS");
});

// get chats of user
APP.get('/user/:id/chats', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM chat WHERE ID IN (SELECT chatID FROM user_chat WHERE userID = ${USERID})`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// delete chat of user
APP.delete('/user/:id/chat', async (req, res) => {
    const USERID = req.params.id;
    const CHATID = req.body.chatID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if chat id exists
    let sql = `SELECT * FROM user_chat WHERE userID = ${USERID} AND chatID = ${CHATID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("Chat not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `DELETE FROM user_chat WHERE userID = ${USERID} AND chatID = ${CHATID}`;
    result = await sqlQuery(sql);

    sql = `DELETE FROM chat WHERE ID = ${CHATID}`;
    result = await sqlQuery(sql);
    res.send("Chat deleted");

    log(req, res, "SUCCESS");
});

// get messages of chat
APP.get('/chat/:id/messages', async (req, res) => {
    const CHATID = req.params.id;
    
    const SQL = `SELECT * FROM message WHERE ID IN (SELECT messageID FROM chat_message WHERE chatID = ${CHATID})`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// add message to chat
APP.post('/chat/:id/message', async (req, res) => {
    const CHATID = req.params.id;
    const BODY = req.body;
    const MESSAGE = {text: BODY.text, time: BODY.time, userID: BODY.userID};
    
    // check if chat id exists
    let result = await userIdExists(CHATID);
    if (!result) {
        res.status(404).send("Chat not found");
        log(req, res, "ERROR");
        return;
    }

    // check if user id exists
    result = await userIdExists(MESSAGE.userID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO message (text, time, userID) VALUES ('${MESSAGE.text}', '${MESSAGE.time}', ${MESSAGE.userID})`;
    result = await sqlQuery(sql);
    const MESSAGEID = result.insertId;

    sql = `INSERT INTO chat_message (chatID, messageID) VALUES (${CHATID}, ${MESSAGEID})`;
    result = await sqlQuery(sql);
    res.send("Message added");

    log(req, res, "SUCCESS");
});

// delete message of chat
APP.delete('/chat/:id/message', async (req, res) => {
    const CHATID = req.params.id;
    const MESSAGEID = req.body.messageID;
    
    // check if chat id exists
    let result = await userIdExists(CHATID);
    if (!result) {
        res.status(404).send("Chat not found");
        log(req, res, "ERROR");
        return;
    }

    // check if message id exists
    let sql = `SELECT * FROM chat_message WHERE chatID = ${CHATID} AND messageID = ${MESSAGEID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("Message not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `DELETE FROM chat_message WHERE chatID = ${CHATID} AND messageID = ${MESSAGEID}`;
    result = await sqlQuery(sql);

    sql = `DELETE FROM message WHERE ID = ${MESSAGEID}`;
    result = await sqlQuery(sql);
    res.send("Message deleted");

    log(req, res, "SUCCESS");
});

APP.listen(PORT, () => {
    console.log('Listening on port 3000...')
});

function log(req, res, tag = "INFO") {
    message = `${format(req.method, 6)} ${format(req.url, 35)} ${res.statusCode}`;
    switch (tag) {
        case "INFO":
            break;
        case "ERROR":
            message = "\u001b[1;31m" + message + "\u001b[0m";
            break;
        case "SUCCESS":
            message = "\u001b[1;32m" + message + "\u001b[0m";
            break;
        default:
            break;
    }
    console.log(message);
}

function format(string, length) {
    if (string.length < length) {
        for (let i = string.length; i < length; i++) {
            string += ' ';
        }
    }
    return string;
}

async function sqlQuery(SQL) {
    return new Promise((resolve, reject) => {
        const CONNECTION = MYSQL.createConnection(
            credentials[0]
        );

        CONNECTION.connect();

        CONNECTION.query(SQL, (error, results, fields) => {
            if (error) reject(error);
            resolve(results);
        });

        CONNECTION.end();
    });
}

async function addressAlreadyExists(address) {
    // true if exists, false if not
    const SQL = `SELECT * FROM address WHERE street = '${address.street}' AND city = '${address.city}' AND zip = ${address.zip} AND number = ${address.number}`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}

async function addressInUse(addressID) {
    // amount of users using the address
    const SQL = `SELECT * FROM users WHERE addressID = ${addressID}`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length;
}

async function userIdExists(id) {
    // true if exists, false if not
    const SQL = `SELECT * FROM users WHERE ID = ${id}`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}

async function userEmailExists(email, exception = undefined) {
    // true if exists, false if not
    if(exception) {
        const SQL = `SELECT * FROM users WHERE email = '${email}' AND email != '${exception}'`;
        const RESULT = await sqlQuery(SQL);
        return RESULT.length !== 0;
    }
    const SQL = `SELECT * FROM users WHERE email = '${email}'`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}

async function userUsernameExists(username, exception = undefined) {
    // true if exists, false if not
    if(exception) {
        const SQL = `SELECT * FROM users WHERE username = '${username}' AND username != '${exception}'`;
        const RESULT = await sqlQuery(SQL);
        return RESULT.length !== 0;
    }
    const SQL = `SELECT * FROM users WHERE username = '${username}'`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}

async function getUser(ID) {
    const SQL = `SELECT * FROM users WHERE ID = ${ID}`;
    const RESULT = await sqlQuery(SQL);
    
    
    return RESULT[0];
}

async function userCarExists(userID, carID) {
    // true if exists, false if not
    const SQL = `SELECT * FROM user_vehicle WHERE userID = ${userID} AND vehicleID = ${carID}`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}