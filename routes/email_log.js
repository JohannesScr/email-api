const squel = require('squel').useFlavour('postgres');
const {db} = require('../database/database');
const {sg_post} = require('../includes/sendgrid.integration');
const {format_date} = require('../extends/utils');

/* HELPER FUNCTIONS */
/** @function create_email_log
 * @param data
 * @description given properly formatted email log data, the data is
 * inserted into the DB either as SCHEDULED to be sent of on a given
 * date and time, or OUTBOX when it is to be sent immediately.
 * */
const create_email_log = (data) => {
    console.time('/routes/email_log/create_email_log');

    data.email_data = JSON.stringify(data.email_data);

    let sql = squel.insert()
            .into('tb_email_log')
            .setFields(data)
            .returning('*')
            .toParam();

    return new Promise((resolve, reject) => {
        db.one(sql.text, sql.values)
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


/** @function update_email_log_status
 * @param status
 * @param email_log_id
 * @description given the status and email_log_id the email log is updated
 * to the given status.
 * */
const update_email_log_status = (status, email_log_id) => {
    console.time('/routes/email_log/update_email_log_status');

    let sql = squel.update()
            .table('tb_email_log')
            .set('status_code', status)
            .where('id = ?', email_log_id)
            .toParam();

    db.none(sql.text, sql.values)
            .then(() => {
                console.log(`Email log status code successfully update: ${status} for log id: ${email_log_id}`);
                console.timeEnd('/routes/email_log/update_email_log_status');
            })
            .catch(err => {
                console.warn('Error: email_log/update_email_log_status');
                console.warn(JSON.stringify(err, null, 4));
                console.warn(`Unable to update email log status code: ${status} for log id: ${email_log_id}`);
                console.timeEnd('/routes/email_log/update_email_log_status');
            });
};


/* SECONDARY FUNCTIONS */
/** @function fetch_template
 * @param req
 * @description based on the template_code passed in the request the
 * template data and template type is fetched from the DB.
 *
 * If it is not found, as error is thrown.
 * */
const fetch_template = (req) => {
    console.time('/routes/email_log/fetch_template');
    let template_code = req.body.template_code;

    let sql = squel.select()
            .field('template_type', 'type')
            .field('template_data', 'value')
            .from('tb_template')
            .where('template_code =?', template_code)
            .toParam();

    return new Promise((resolve, reject) => {
        db.many(sql.text, sql.values)
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


/** @function build_email
 * @param req
 * @description builds both the email log and the message objects to be
 * saved and sent.
 * */
const build_email = (req) => {
    console.time('/routes/email_log/build_email');
    return new Promise((resolve, reject) => {

        req.wf.data.email_log = {
            template_code: req.body.template_code,
            token_code: req.token.token_code,
            email_from: JSON.stringify(req.body.from),
            email_to: JSON.stringify(req.body.to),
            email_subject: req.body.subject,
            status_code: req.body.immediate ? 'OUTBOX' : 'SCHEDULED',
            action_date: req.body.immediate ? format_date(new Date()) : req.body.action_date,
            email_data: req.body.data
        };

        req.wf.data.message = {
            personalizations: [
                {
                    to: req.body.to,
                    subject: req.body.subject
                }
            ],
            from: req.body.from,
            content: req.wf.data.template,
        };

        if (req.body.hasOwnProperty('reply_to')) {
            req.wf.data.message.reply_to = req.body.reply_to;
            req.wf.data.email_log.email_reply_to = JSON.stringify(req.body.reply_to);
        }
        if (req.body.hasOwnProperty('cc')) {
            req.wf.data.message.personalizations.cc = req.body.cc;
            req.wf.data.email_log.email_cc = JSON.stringify(req.body.cc);
        }
        if (req.body.hasOwnProperty('bcc')) {
            req.wf.data.message.personalizations.bcc = req.body.bcc;
            req.wf.data.email_log.email_bcc = JSON.stringify(req.body.bcc);
        }

        console.timeEnd('/routes/email_log/build_email');
        resolve(req);
    });
};


/** @function single_email_log
 * @param req
 * @description creates an email log. if the message is to be sent
 * immediately then it is sent immediately and the status is updated to SENT.
 * */
const single_email_log = (req) => {
    console.time('/routes/email_log/single_email_log');

    return new Promise((resolve, reject) => {
        create_email_log(req.wf.data.email_log)
                .then(email_log => {
                    console.log('Email Log:', email_log);

                    req.wf.data.email_log = email_log;
                    if (req.body.immediate) {

                        let message = req.wf.data.message;
                        sg_post(message)
                                .then(data => {
                                    console.log(data);
                                    req.wf.message = data.status;

                                    update_email_log_status('SENT', email_log.id);

                                    console.timeEnd('/routes/email_log/single_email_log');
                                    resolve(req);
                                })
                                .catch(err => {
                                    console.warn('Error: /routes/email_log/single_email_log');
                                    console.warn(err);
                                    req.wf.message = err.status;
                                    req.wf.errors.push({
                                        message: 'Unable to send email',
                                    });

                                    update_email_log_status('REJECTED', email_log.id);

                                    console.timeEnd('/routes/email_log/single_email_log');
                                    reject(req);
                                });
                    } else {
                        resolve(req);
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
/** @function single_email
 * @param req
 * @param res
 * @param next
 * @description creates and/or sends an immediate email for a SINGLE email.
 * */
const single_email = (req, res, next) => {
    console.time('/routes/email_log/send_email');

    if (req.body.immediate) {

    } else if (!req.body.action_date) {
        res.status(400).send({
            message: 'Missing fields',
            error: 'action date is a required field'
        })
    }

    fetch_template(req)
            .then(build_email)
            .then(single_email_log)
            .then((req) => {

                delete req.wf.data.template;
                delete req.wf.data.message;

                console.log('Email sent successfully');
                console.timeEnd('/routes/email_log/send_email');
                res.send(req.wf);
            })
            .catch(err => {
                console.warn('Error: /routes/email_log/send_email');

                req.wf.http_code = 500;
                req.wf.message = 'Unable to add to email log';

                let error = {
                    message: 'Unable to add to email log',
                };
                if (!err.hasOwnProperty('wf')) {
                    error.err = err;
                }
                req.wf.errors.push(error);

                console.timeEnd('/routes/email_log/send_email');
                console.log('<### Error: send_email');
                res.status(req.wf.http_code).send(req.wf);
            });
};


/* EXPORTED FUNCTIONS */
module.exports = {
    single_email
};