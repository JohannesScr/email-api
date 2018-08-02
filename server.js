const express = require('express');
const bodyParser = require('body-parser');

const {setup} = require('./includes/setup');
const {log_url, build_workflow_object} = require('./includes/server.init');
const {test_mail} = require('./includes/sendgrid.integration');

// initialise setup of environment
setup();

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

app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});