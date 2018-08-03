const fs = require('fs');
const path = require('path');

const sgMail = require('@sendgrid/mail');

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
    sgMail,
    test_mail
};