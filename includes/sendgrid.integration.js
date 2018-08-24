const fs = require('fs');
const path = require('path');

const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const client = require('@sendgrid/client');

/** @function sg_send_promise
 * @param message
 * @description basic email - sends email content using SendGrid node API
 * */
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

/** @function sg_send
 * @param message
 * @description basic email - sends email content using SendGrid node API
 * */
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

/** @function sg_post
 * @param message {object}
 * @description sends a post request to SendGrid that allows for more options than the npm package
 * @returns {object}
 * */
const sg_post = (message) => {
    console.time('/includes/sendgrid.integration/sg_post');

    let request = {
        method: 'post',
        url: `${process.env.SENDGRID_API_URL}/v3/mail/send`,
        headers: {
            "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json"
        },
        data: message
    };

    return new Promise((resolve, reject) => {
        console.log(JSON.stringify(request, null, 4));

        axios(request)
                .then(result => {
                    console.log(result.status, result.statusText);
                    console.timeEnd('/includes/sendgrid.integration/sg_post');
                    resolve({
                        status: 'success'
                    });
                })
                .catch(err => {
                    console.warn('Error: sendgrid.integration/sg_post');
                    console.warn(err.message, JSON.stringify(err.response.data, null, 4));
                    console.timeEnd('/includes/sendgrid.integration/sg_post');
                    reject({
                        status: 'fail'
                    });
                });
    });
};

/** @function test_mail
 * @description endpoint to test SendGrid node API
 * */
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

/** @function test_mail
 * @description endpoint to test post request to SendGrid
 * */
const test_mail_post = (req, res) => {
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // client.setApiKey(process.env.SENDGRID_API_KEY);
    // client.setDefaultRequest('baseUrl', 'https://api.sendgrid.com/');
    // client.setDefaultHeader('Authorization', `Bearer ${process.env.SENDGRID_API_KEY}`);
    // client.setDefaultHeader('Content-Type', 'application/json');

    let template_path = path.join(__dirname, './../templates/test.html');
    let template = fs.readFileSync(template_path, 'utf8');

    try {
        let request = {
            method: 'post',
            url: `${process.env.SENDGRID_API_URL}v3/mail/send`,
            headers: {
                "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
                "Content-Type": "application/json"
            },
            data: {
                personalizations: [
                    {
                        to: [
                            {
                                email: 'johannes.scri@gmail.com',
                                name: 'Johannes Scribante'
                            }
                        ],
                        cc: [
                            {
                                email: 'johannes@stratech.co.za',
                                name: 'Johannes Work'
                            }
                        ],
                        subject: 'test post email'
                    }
                ],
                from: {
                    email: 'no-reply@johannesscribante.com',
                    name: 'no-reply johannesscribante.com'
                },
                reply_to: {
                    email: 'johannes.scri@gmail.com',
                    name: 'Johannes Scribante'
                },
                content: [
                    {
                        type: 'text/html',
                        value: template
                    }
                ]
            }
        };

        console.log(JSON.stringify(request, null, 4));

        axios(request)
                .then(() => {
                    console.log('a');
                })
                .catch(err => {
                    console.warn(JSON.stringify(err, null, 4));
                });
    } catch (err) {
        console.warn(err);
    }

    res.send('logged template');
};

module.exports = {
    test_mail,
    sg_post,
    test_mail_post,
    sg_send_promise,
    sg_send
};