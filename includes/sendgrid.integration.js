const fs = require('fs');
const path = require('path');

const sgMail = require('@sendgrid/mail');

const sg_send_promise = (message) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    return new Promise((resolve, reject) => {
        try {
            sgMail.send(message);
        } catch (err) {
            console.warn('Error: /includes/sendgrid.integration/sendgrid_send_promise', err);
            reject(err);
        }

        resolve(message);
    });
};

const sg_send = (message) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        sgMail.send(message);
    } catch (err) {
        console.warn('Error: /includes/sendgrid.integration/sendgrid_send', err);
        return {
            code: false,
            message: 'Unable to send email',
            field: message,
            error: err
        };
    }

    return {
        code: true,
        message: 'Email sent successfully'
    };
};

const test_mail = (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    let template_path = path.join(__dirname, './../templates/test.html');
    let template = fs.readFileSync(template_path, 'utf8');

    let message = {
        to: req.body.to,
        from: req.body.from,
        subject: req.body.subject,
        text: req.body.text,
        html: template
    };

    console.log(message);

    try {
        sgMail.send(message);
    } catch (err) {
        console.warn(err);
    }

    res.send('logged template');
};

module.exports = {
    test_mail,
    sg_send_promise,
    sg_send
};