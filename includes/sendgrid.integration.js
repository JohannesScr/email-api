const fs = require('fs');
const path = require('path');

const sgMail = require('@sendgrid/mail');

const test_mail = (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    let template_path = path.join(__dirname, './../templates/test.html');
    let template = fs.readFileSync(template_path, 'utf8');

    let message = {
        to: req.body.from,
        from: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
        html: template
    };

    // const msg = {
    //     to: 'johannes@stratech.co.za',
    //     from: 'test@example.com',
    //     subject: 'Sending with SendGrid is Fun',
    //     text: 'and easy to do anywhere, even with Node.js, should all fail localhost:3201/forgot_password?token=12458723qco8g4oqo378g',
    //     html: '<h2>HTML</h2>' +
    //     '<strong>and easy to do anywhere, even with Node.js</strong>' +
    //     '<p><a href="http://localhost:3201/forgot_password?token=12458723qco8g4oqo378g" target="_blank">http://localhost:3201/forgot_password?token=12458723qco8g4oqo378g</a></p>',
    // };

    console.log(template);

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