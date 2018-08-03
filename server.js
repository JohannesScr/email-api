const express = require('express');
const bodyParser = require('body-parser');

const {log_url, build_workflow_object} = require('./includes/server.init');
const {check} = require('./includes/authentication');

const {test_mail} = require('./includes/sendgrid.integration');

// ROUTES
const {post_token, put_token, patch_token, get_token} = require('./routes/token/token');
const {send_email} = require('./routes/email_log/email_log');

let app = express();
let PORT = process.env.PORT;

// ########### GENERIC MIDDLEWARE

// TODO hash passwords
app.use(bodyParser.json());
// app.use(log_url);
app.use(build_workflow_object);
app.use(check);

// ########### ROUTES

// TEST EMAIL
app.post('/test', test_mail);

// TOKENS
app.post('/token', post_token);
app.put('/token', put_token);
app.patch('/token', patch_token);
app.get('/token', get_token);
app.get('/token/:id', get_token);

// SEND SINGLE EMAIL
app.post('/send_email', send_email);

// ERROR HANDLING
app.use((err, req, res, next) => {
    console.warn('Error handling');
    res.status(req.wf.http_code).send(req.wf);
});


app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});