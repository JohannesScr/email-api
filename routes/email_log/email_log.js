const squel = require('squel').useFlavour('postgres');
const {db} = require('./../../database/database');
const {sg_send, sg_send_promise} = require('./../../includes/sendgrid.integration');
const {format_date} = require('./../../extends/utils');

/* HELPER FUNCTIONS */

const create_email_log = (data) => {
    console.time('/routes/email_log/create_email_log');

    data.email_data = JSON.stringify(data.email_data);

    let sql = squel.insert()
            .into('tb_email_log')
            .setFields(data)
            .returning('*')
            .toParam();

    return new Promise((resolve, reject) => {
        db.any(sql.text, sql.values)
                .then(template => {
                    console.timeEnd('/routes/email_log/create_email_log');
                    resolve(template);
                })
                .catch(err => {
                    console.warn('Error: /routes/email_log/create_email_log', err);
                    console.timeEnd('/routes/email_log/create_email_log');
                    reject(err)
                });
    });
};

/* SECONDARY FUNCTIONS */
/**
 * */
const fetch_template = (req) => {
    console.time('/routes/email_log/fetch_template');
    let template_code = req.body.template_code;

    let sql = squel.select()
            .from('tb_template')
            .where('template_code =?', template_code)
            .toParam();

    return new Promise((resolve, reject) => {
        db.one(sql.text, sql.values)
                .then(template => {
                    console.timeEnd('/routes/email_log/fetch_template');
                    req.wf.data.template = template;
                    resolve(req);
                })
                .catch(err => {
                    console.warn('Error: /routes/email_log/fetch_template', err);
                    req.wf.errors.push({
                        message: 'Unable to fetch email template',
                        error: err
                    });

                    console.timeEnd('/routes/email_log/fetch_template');
                    reject(req);
                });
    });
};

/**
 * */
const build_email = (req) => {
    console.time('/routes/email_log/build_email');
    return new Promise((resolve, reject) => {

        req.wf.data.email_log = {
            template_code: req.body.template_code,
            token_code: req.token_code,
            email_from: req.body.from,
            email_to: req.body.to,
            status_code: req.body.immediate ? 'OUTBOX' : 'SCHEDULED',
            action_date: req.body.immediate ? format_date(new Date()) : req.body.action_date,
            email_data: req.body.data
        };

        req.wf.data.message = {
            to: req.body.to,
            from: req.body.from,
            subject: req.body.subject,
            text: req.body.text,
            html: req.wf.data.template.template_data,
        };

        console.timeEnd('/routes/email_log/build_email');
        resolve(req);
    });
};

/**
 * */
const single_email_log = (req) => {
    console.time('/routes/email_log/single_email_log');

    return new Promise((resolve, reject) => {
        create_email_log(req.wf.data.email_log)
                .then(email_log => {
                    console.log('Email Log:', email_log);

                    if (req.body.immediate) {
                        let result = sg_send(req.wf.data.message);
                        console.log(result.message);

                        console.timeEnd('/routes/email_log/single_email_log');
                        if (result.code) {
                            req.wf.message = result.message;
                            resolve(req);
                        } else {
                            req.wf.errors.push({
                                message: 'Unable to create email log',
                                error: result.error
                            });
                            reject(req);
                        }

                    }
                })
                .catch(err => {
                    console.warn('Error: /routes/email_log/single_email_log', err);
                    req.wf.errors.push({
                        message: 'Unable to create email log',
                        error: err
                    });

                    console.timeEnd('/routes/email_log/single_email_log');
                    reject(req);
                });
    });
};

/* PRIMARY FUNCTIONS */
/**
 * */
const send_email = (req, res, next) => {
    fetch_template(req)
            .then(build_email)
            .then(single_email_log)
            .then(() => {
                console.log('Email sent successfully');
                res.send(req.wf);
            })
            .catch(err => {
                console.warn('Error: /routes/email_log/send_email', err);

                req.wf.http_code = 500;
                req.wf.message = 'Unable to add to email log';

                let error = {
                    message: 'Unable to add to email log',
                };
                if (!err.hasOwnProperty('wf')) {
                    error.err = err;
                }
                req.wf.errors.push(error);


                console.timeEnd('routes/email_log/send_email');
                console.log('<### Error: send_email');
                res.status(req.wf.http_code).send(req.wf);
            });
};

/* EXPORTED FUNCTIONS */
module.exports = {
    send_email
};