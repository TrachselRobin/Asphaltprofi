const express = require('express');
const APP = express();
const MYSQL = require('mysql');

const PORT = process.env.PORT || 3000;

const credentials = require('./credentials.json');

APP.use(express.json());

APP.get('/', async (req, res) => {
    res.send("Helo");
    log(req, res);
});

APP.get('/users', async (req, res) => {
    const SQL = 'SELECT * FROM users';
    
    const RESULT = await sqlQuery(SQL);
    res.send(RESULT);

    log(req, res);
});

APP.get('/user/:id', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        return;
    }

    const SQL = `SELECT * FROM users WHERE ID = ${USERID}`;
    result = await sqlQuery(SQL);
    res.send(result);

    log(req, res);
});

APP.post('/user', async (req, res) => {
    const BODY = req.body;
    const USER = {prename: BODY.prename, name: BODY.name, age: BODY.age, username: BODY.username, email: BODY.email, password: BODY.password, aboID: BODY.aboID};
    const ADDRESS = {street: BODY.street, city: BODY.city, zip: BODY.zip, number: BODY.number};
    
    // check if user email exists
    let result = await userEmailExists(USER.email);
    if (result) {
        res.status(409).send("Email already exists");
        return;
    }

    // check if user username exists
    result = await userUsernameExists(USER.username);
    if (result) {
        res.status(409).send("Username already exists");
        return;
    }

    if (!await addressAlreadyExists(ADDRESS)) {
        sql = `INSERT INTO address (street, city, zip, number) VALUES ("${ADDRESS.street}", "${ADDRESS.city}", ${ADDRESS.zip}, ${ADDRESS.number})`;
        result = await sqlQuery(sql);
    }
    
    sql = `INSERT INTO users (prename, name, age, username, email, password, aboID, addressID) VALUES ('${USER.prename}', '${USER.name}', ${USER.age}, '${USER.username}', '${USER.email}', '${USER.password}', ${USER.aboID}, (SELECT ID FROM address WHERE street = '${ADDRESS.street}' AND number = ${ADDRESS.number} AND zip = ${ADDRESS.zip} AND city = '${ADDRESS.city}'))`;
    result = await sqlQuery(sql);

    res.send("User added");
    
    log(req, res);
});

APP.put('/user/:id', async (req, res) => {
    const BODY = req.body;
    const USEROLD = await getUser(req.params.id);
    const USER = {prename: BODY.prename, name: BODY.name, age: BODY.age, username: BODY.username, email: BODY.email, password: BODY.password};
    const ADDRESS = {street: BODY.street, city: BODY.city, zip: BODY.zip, number: BODY.number, addressID: undefined};
    
    // check if user id exists
    let result = await userIdExists(req.params.id);
    if (!result) {
        res.status(404).send("User not found");
        return;
    }

    // check if user email exists
    result = await userEmailExists(USER.email, USEROLD.email);
    if (result) {
        res.status(409).send("Email already exists");
        return;
    }

    // check if user username exists
    result = await userUsernameExists(USER.username, USEROLD.username);
    if (result) {
        res.status(409).send("Username already exists");
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

    sql = `UPDATE users SET prename = '${USER.prename}', name = '${USER.name}', age = ${USER.age}, username = '${USER.username}', email = '${USER.email}', password = '${USER.password}', addressID = ${ADDRESS.addressID} WHERE ID = ${req.params.id}`;
    result = await sqlQuery(sql);

    res.send("User updated");
    
    log(req, res);
});

APP.delete('/user/:id', async (req, res) => {
    const USERID = req.params.id;
    
    // check if user id exists
    let result = await userIdExists(USERID);
    if (!result) {
        res.status(404).send("User not found");
        return;
    }

    const SQL = `DELETE FROM users WHERE ID = ${USERID}`;
    result = await sqlQuery(SQL);
    res.send("User deleted");

    log(req, res);
});

APP.listen(PORT, () => {
    console.log('Listening on port 3000...')
});

function log(req, res) {
    console.log(`${format(req.method, 6)} ${format(req.url, 25)} ${res.statusCode}`);
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
    /*
    RESULT = [
        RowDataPacket {
            ID: 1000000003,
            prename: 'Robin',
            name: 'Trachsel',
            age: 19,
            username: 'DoktorHodenlos',
            email: 'ro.trachsel@vtxfre.ch',
            password: '123',
            aboID: 1,
            addressID: 3
        }
    ]
    */

    return RESULT[0];
}