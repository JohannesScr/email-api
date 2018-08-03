const express = require('express');
const bodyParser = require('body-parser');

const {log_url, build_workflow_object} = require('./includes/server.init');
const {test_mail} = require('./includes/sendgrid.integration');

// ROUTES
const {post_token, put_token, patch_token, get_token} = require('./routes/token/token');

let app = express();
let PORT = process.env.PORT;

// ########### GENERIC MIDDLEWARE

// TODO hash passwords
app.use(bodyParser.json());
app.use(log_url);
app.use(build_workflow_object);
// TODO validation module

// ########### ROUTES

const gen = (req, res) => {
    console.log(req.method);
    console.log(req.url);
    console.log(req.headers);

    if (req.hasOwnProperty('body'))
        console.log(req.body);

    res.send({
        status: 'successful',
        method: req.method
    })
};

app.post('/post', gen);
app.put('/put', gen);
app.patch('/patch', gen);
app.get('/get', gen);
app.delete('/delete', gen);

// TEST EMAIL
app.post('/test', test_mail);

// TOKENS
app.post('/token', post_token);
app.put('/token', put_token);
app.patch('/token', patch_token);
app.get('/token', get_token);
app.get('/token/:id', get_token);


app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});