const express = require('express');
const APP = express();
const MYSQL = require('mysql');

const PORT = process.env.PORT || 3000;

const credentials = require('./credentials.json');

const multer = require('multer');

// Spezifizieren Sie den Speicherort und den Dateinamen für die hochgeladenen Dateien
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './databaseImages'); // Verzeichnis für hochgeladene Bilder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname); // Benennen Sie die hochgeladene Datei um
    }
});

// Konfigurieren Sie Multer mit dem Speicherort und den Dateinamen
const upload = multer({ storage: storage });

APP.use(express.json());

APP.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header("Access-Control-Allow-Headers", "Content-Type"); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

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

APP.get('/token/:token', async (req, res) => {
    const TOKEN = req.params.token;
    
    // check if token exists
    let result = await tokenExists(TOKEN);
    if (!result) {
        res.status(404).send("Token not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM users WHERE token = '${TOKEN}'`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

APP.post('/user', async (req, res) => {
    const BODY = req.body;
    const USER = {prename: BODY.prename, name: BODY.name, birthdate: BODY.birthdate, username: BODY.username, email: BODY.email, password: BODY.password.hashCode(), imageURL: BODY.image ,aboID: 1};
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
    
    sql = `INSERT INTO users (prename, name, birthdate, username, email, password, aboID, addressID, image) VALUES ('${USER.prename}', '${USER.name}', '${USER.birthdate}', '${USER.username}', '${USER.email}', '${USER.password}', ${USER.aboID}, (SELECT ID FROM address WHERE street = '${ADDRESS.street}' AND number = ${ADDRESS.number} AND zip = ${ADDRESS.zip} AND city = '${ADDRESS.city}'), '${USER.imageURL}')`;
    result = await sqlQuery(sql);

    const TOKEN = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // update token and tokenCreation to current time
    sql = `UPDATE users SET token = '${TOKEN}', tokenCreation = NOW() WHERE email = '${USER.email}' AND password = '${USER.password}'`;
    result = await sqlQuery(sql);

    // send token as json
    res.send(TOKEN);
    
    log(req, res, "SUCCESS");
});

APP.put('/user', async (req, res) => {
    const BODY = req.body;
    const USEROLD = await getUser(BODY.userID);
    const USER = {prename: BODY.prename, name: BODY.name, birthdate: BODY.birthdate, username: BODY.username, email: BODY.email, password: BODY.password, image: BODY.image};
    const ADDRESS = {street: BODY.street, city: BODY.city, zip: BODY.zip, number: BODY.number, addressID: undefined};
    
    // check if user id exists
    let result = await userIdExists(BODY.userID);
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

    sql = `UPDATE users SET prename = '${USER.prename}', name = '${USER.name}', birthdate = '${USER.birthdate}', username = '${USER.username}', email = '${USER.email}', password = '${USER.password}', addressID = ${ADDRESS.addressID} WHERE ID = ${BODY.userID}`;
    result = await sqlQuery(sql);

    res.send("User updated");
    
    log(req, res, "SUCCESS");
});

APP.delete('/user', async (req, res) => {
    const USERID = req.body.userID;
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

APP.get('/check/email/:email', async (req, res) => {
    const EMAIL = req.params.email;

    // check if user email exists
    let result = await userEmailExists(EMAIL);
    if (result) {
        res.status(409).send("Email already exists");
        log(req, res, "ERROR");
        return;
    }

    res.send("Email available");

    log(req, res, "SUCCESS");
});

APP.get('/check/username/:username', async (req, res) => {
    const USERNAME = req.params.username;

    // check if user username exists
    let result = await userUsernameExists(USERNAME);
    if (result) {
        res.status(409).send("Username already exists");
        log(req, res, "ERROR");
        return;
    }

    res.send("Username available");

    log(req, res, "SUCCESS");
});

APP.post('/user/car', async (req, res) => {
    const USERID = req.body.userID;
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

// returns a json of every car and its times like following
/*
{
    "car": {
        "brand": "brand",
        "model": "model",
        "image": "image",
        "year": "year",
        "hp": "hp",
        "ccm": "ccm",
        "tagID": "tagID",
        "times": [
            {
                "start": "start",
                "end": "end"
            },
            ...
        ]
    }
}
*/
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

    for (let i = 0; i < result.length; i++) {
        const SQL = `SELECT * FROM time WHERE ID IN (SELECT timeID FROM vehicle_time WHERE vehicleID = ${result[i].ID})`;
        const TIMES = await sqlQuery(SQL);
        result[i].times = TIMES;
    }
    
    res.json(result);

    log(req, res, "SUCCESS");
});

// sends a json of the car with the given carID like following
/*
{
    "brand": "brand",
    "model": "model",
    "image": "image",
    "year": "year",
    "hp": "hp",
    "ccm": "ccm",
    "tagID": "tagID",
    "times": [
        {
            "start": "start",
            "end": "end"
        },
        ...
    ]
}
*/
APP.get('/user/:id/car/:carID', async (req, res) => {
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

    sql = `SELECT * FROM vehicle WHERE ID = ${CARID}`;
    result = await sqlQuery(sql);
    const CAR = result[0];

    sql = `SELECT * FROM time WHERE ID IN (SELECT timeID FROM vehicle_time WHERE vehicleID = ${CARID})`;
    const TIMES = await sqlQuery(sql);
    CAR.times = TIMES;

    res.json(CAR);

    log(req, res, "SUCCESS");
});

// delete car of user
APP.delete('/user/car', async (req, res) => {
    const USERID = req.body.userID;
    const CARID = req.body.carID;
    
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
APP.put('/user/car', async (req, res) => {
    const USERID = req.body.userID;
    const CARID = req.body.carID;
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

    USER.password = USER.password.hashCode();
    
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

    // send token as json
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
APP.post('/user/friend', async (req, res) => {
    const USERID = req.body.userID;
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
APP.delete('/user/friend', async (req, res) => {
    const USERID = req.body.userID;
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

// get friend requests
APP.get('/user/:id/friendrequests', async (req, res) => {
    const USERID = req.params.id;

    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM user_friend WHERE friendID = ${USERID}`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res, "SUCCESS");
});

// add time
APP.post('/user/car/time', async (req, res) => {
    const BODY = req.body;
    const TIME = {start: BODY.start, end: BODY.end};
    const USERID = BODY.userID;
    const CARID = BODY.carID;

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

    sql = `INSERT INTO time (start, end) VALUES ('${TIME.start}', '${TIME.end}')`;
    result = await sqlQuery(sql);
    const TIMEID = result.insertId;

    sql = `INSERT INTO vehicle_time (vehicleID, timeID) VALUES (${CARID}, ${TIMEID})`;
    result = await sqlQuery(sql);

    res.send("Time added");

    log(req, res, "SUCCESS");
});

// delete time of user
APP.delete('/user/car/time', async (req, res) => {
    const USERID = req.body.userID;
    const TIMEID = req.body.timeID;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }

    // check if time id exists
    let sql = `SELECT * FROM vehicle_time WHERE timeID = ${TIMEID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("Time not found");
        log(req, res, "ERROR");
        return;
    }

    sql = `DELETE FROM vehicle_time WHERE timeID = ${TIMEID}`;
    result = await sqlQuery(sql);

    sql = `DELETE FROM time WHERE ID = ${TIMEID}`;
    result = await sqlQuery(sql);
    
    res.send("Time deleted");

    log(req, res, "SUCCESS");
});

// Show leaderboard of users with best time
/*
It should return the top 10 users with the best time:
[
    {
        "user": {
            "ID": 1,
            "username": "user1"
        },
        "time": "00:00:00"
    },
    {
        "user": {
            "ID": 2,
            "username": "user2"
        },
        "time": "00:00:00"
    },
    ...
]
*/
APP.get('/leaderboard', async (req, res) => {
    // get top times from table time order by (end - start)
    let result = [];
    let sql = `SELECT * FROM time ORDER BY (end - start) LIMIT 20`;
    result = await sqlQuery(sql);

    for (let i = 0; i < result.length; i++) {
        sql = `SELECT * FROM vehicle_time WHERE timeID = ${result[i].ID}`;
        const CAR = await sqlQuery(sql);
        sql = `SELECT userID FROM user_vehicle WHERE vehicleID = ${CAR[0].vehicleID}`;
        const USERID = await sqlQuery(sql);
        sql = `SELECT ID, username FROM users WHERE ID = ${USERID[0].userID}`;
        const USER = await sqlQuery(sql);
        sql = `SELECT * FROM vehicle WHERE ID = ${CAR[0].vehicleID}`;
        const VEHICLE = await sqlQuery(sql);
        result[i].user = USER[0];
        result[i].vehicle = VEHICLE[0];
    }
    
    res.send(result);

    log(req, res, "SUCCESS");
});

// create chat with a friend
APP.post('/user/chat', async (req, res) => {
    const BODY = req.body;
    const CHAT = {userID: BODY.userID, friendID: BODY.friendID};
    
    // check if user id exists
    let result = await userIdExists(CHAT.userID);
    if (!result) {
        res.status(404).send("User not found");
        log(req, res, "ERROR");
        return;
    }
    
    // check if friend id exists
    result = await userIdExists(CHAT.friendID);
    if (!result) {
        res.status(404).send("Freund nicht gefunden!");
        log(req, res, "ERROR");
        return;
    }

    // check if chat already exists
    let sql = `SELECT * FROM chat WHERE userID = ${CHAT.userID} AND user2ID = ${CHAT.friendID} OR userID = ${CHAT.friendID} AND user2ID = ${CHAT.userID}`;
    result = await sqlQuery(sql);
    if (result.length !== 0) {
        res.status(409).send("Chat existiert bereits!");
        log(req, res, "ERROR");
        return;
    }

    // check if friend is equal to user
    if (CHAT.userID == CHAT.friendID) {
        res.status(409).send("Kein Chat mit sich selbst möglich!");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO chat (userID, user2ID) VALUES (${CHAT.userID}, ${CHAT.friendID})`;
    result = await sqlQuery(sql);
    const CHATID = result.insertId;

    sql = `INSERT INTO user_chat (userID, chatID) VALUES (${CHAT.userID}, ${CHATID})`;
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

    // sql that gets all chats where USERID is equal to userID or user2ID
    let sql = `SELECT * FROM chat WHERE userID = ${USERID} OR user2ID = ${USERID}`;
    result = await sqlQuery(sql);

    for (let i = 0; i < result.length; i++) {
        sql = `SELECT * FROM message WHERE ID IN (SELECT messageID FROM chat_message WHERE chatID = ${result[i].ID} ORDER BY time) ORDER BY time DESC LIMIT 1`;
        result[i].lastMessage = await sqlQuery(sql);
        result[i].lastMessage = result[i].lastMessage[0];
    }

    
    res.send(result);

    log(req, res, "SUCCESS");
});

// delete chat of user
APP.delete('/user/chat', async (req, res) => {
    const USERID = req.body.userID;
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

    // after deleting user_chat, delete chat if no user_chat exists
    sql = `SELECT * FROM user_chat WHERE chatID = ${CHATID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        sql = `DELETE FROM chat WHERE ID = ${CHATID}`;
        result = await sqlQuery(sql);
    }

    
    res.send("Chat deleted");

    log(req, res, "SUCCESS");
});

// rename chat
APP.put('/user/chat', async (req, res) => {
    const USERID = req.body.userID;
    const CHATID = req.body.chatID;
    const NAME = req.body.name;
    
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

    sql = `UPDATE chat SET name = '${NAME}' WHERE ID = ${CHATID}`;
    result = await sqlQuery(sql);
    res.send("Chat renamed");

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
APP.post('/chat/message', async (req, res) => {
    const BODY = req.body;
    const CHATID = BODY.chatID;
    const MESSAGE = { text: BODY.text, userID: BODY.userID };
    
    // check if chat id exists
    let sql = `SELECT * FROM chat WHERE ID = ${CHATID}`;
    let result = await sqlQuery(sql);
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

    // check if user is in chat
    sql = `SELECT * FROM user_chat WHERE userID = ${MESSAGE.userID} AND chatID = ${CHATID}`;
    result = await sqlQuery(sql);
    if (result.length === 0) {
        res.status(404).send("User not in chat");
        log(req, res, "ERROR");
        return;
    }

    sql = `INSERT INTO message (text, time, userID) VALUES ('${MESSAGE.text}', NOW(), ${MESSAGE.userID})`;
    result = await sqlQuery(sql);
    const MESSAGEID = result.insertId;

    sql = `INSERT INTO chat_message (chatID, messageID) VALUES (${CHATID}, ${MESSAGEID})`;
    result = await sqlQuery(sql);
    res.send("Message added");

    log(req, res, "SUCCESS");
});

// delete message of chat
APP.delete('/chat/message', async (req, res) => {
    const CHATID = req.body.chatID;
    const MESSAGEID = req.body.messageID;
    
    // check if chat id exists
    let sql = `SELECT * FROM chat WHERE ID = ${CHATID}`;
    let result = await sqlQuery(sql);
    if (!result) {
        res.status(404).send("Chat not found");
        log(req, res, "ERROR");
        return;
    }

    // check if message id exists
    sql = `SELECT * FROM chat_message WHERE chatID = ${CHATID} AND messageID = ${MESSAGEID}`;
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

APP.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No files were uploaded.');
        log(req, res, "ERROR");
        return;
    }

    // Der Dateiname der hochgeladenen Datei wird in req.file.filename gespeichert

    res.send('File uploaded successfully!');
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

async function tokenExists(token) {
    // true if exists, false if not
    const SQL = `SELECT * FROM users WHERE token = '${token}'`;
    const RESULT = await sqlQuery(SQL);
    return RESULT.length !== 0;
}

String.prototype.hashCode = function () {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

/*
All requests and example header and urls

GET http://localhost:3000/

GET http://localhost:3000/user/1000000000
GET http://localhost:3000/users
POST http://localhost:3000/user
PUT http://localhost:3000/user
DELETE http://localhost:3000/user

GET http://localhost:3000/user/1000000000/cars
POST http://localhost:3000/user/car
PUT http://localhost:3000/user/car
DELETE http://localhost:3000/user/car

GET http://localhost:3000/verify/asdf9h4jn49houosd
POST http://localhost:3000/login
DELETE http://localhost:3000/logout

GET http://localhost:3000/user/1000000000/friends
POST http://localhost:3000/user/friend
DELETE http://localhost:3000/user/friend

GET http://localhost:3000/user/1000000000/times
POST http://localhost:3000/user/time
DELETE http://localhost:3000/user/time

GET http://localhost:3000/leaderboard

GET http://localhost:3000/user/1000000000/chats
POST http://localhost:3000/user/chat
DELETE http://localhost:3000/user/chat
PUT http://localhost:3000/user/chat

GET http://localhost:3000/chat/1000000000/messages
POST http://localhost:3000/chat/message
DELETE http://localhost:3000/chat/message

*/