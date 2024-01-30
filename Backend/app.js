// express database
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
    log(req, res);
});

app.get('/test', (req, res) => {
    res.send([1, 2, 3]);
    log(req, res);
});

app.listen(PORT, () => {
    console.log('Listening on port 3000...')
});

function log(req, res) {
    // example log: GET /api/books 200 ${res.responseTime}ms
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
}