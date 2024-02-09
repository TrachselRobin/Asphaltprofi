const express = require('express');
const app = express();
const mysql = require('mysql');

const PORT = process.env.PORT || 3000;

const credentials = require('./credentials.json');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
    log(req, res);
});

app.get('/users', (req, res) => {
    query('SELECT * FROM users', res);
    
    log(req, res);
});

app.get('/user/:id', (req, res) => {
    query(`SELECT * FROM users WHERE id = ${req.params.id}`, res);
    
    log(req, res);
});

app.listen(PORT, () => {
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

function query(sql, res) {
    const connection = mysql.createConnection(
        credentials[0]
    );

    connection.connect();

    connection.query(sql, (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    });

    connection.end();
}
