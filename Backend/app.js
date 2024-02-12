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
    sql = `UPDATE users SET token = '${TOKEN}' WHERE email = '${USER.email}' AND password = '${USER.password}'`;
    result = await sqlQuery(sql);

    res.send(TOKEN);

    log(req, res, "SUCCESS");
});

// verify: check if user is logged in
APP.get('/verify', async (req, res) => {
    const TOKEN = req.headers.authorization;
    if (TOKEN === undefined) {
        res.status(401).send("Not logged in");
        log(req, res, "ERROR");
        return;
    }

    const SQL = `SELECT * FROM users WHERE token = '${TOKEN}'`;
    const RESULT = await sqlQuery(SQL);
    if (RESULT.length === 0) {
        res.status(401).send("Not logged in");
        log(req, res, "ERROR");
        return;
    }
    res.send("Logged in");

    log(req, res, "SUCCESS");
});

APP.listen(PORT, () => {
    console.log('Listening on port 3000...')
});

function log(req, res, tag = "INFO") {
    message = `${format(req.method, 6)} ${format(req.url, 25)} ${res.statusCode}`;
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