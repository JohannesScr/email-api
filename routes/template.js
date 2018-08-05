const squel = require('squel').useFlavour('postgres');
const {db} = require('../database/database');
const {formate_date, generate_token_uuid} = require('../extends/utils');

/* HELPER FUNCTIONS */

/* SECONDARY FUNCTIONS */

const build_template = (req) => {
    return new Promise((resolve, reject) => {
        let errors = [];
        let template_data = {
            template_code: req.wf.data.template_code,
            template_name: req.body.template_name,
            description: req.body.description,
            template_data: req.body.template_data,
            active: req.body.active || true
        };

        // verify for null values
        Object.keys(template_data).forEach(key => {
            if (template_data[key] === null || template_data[key] === undefined) {
                errors.push({
                    message: 'Required field is missing',
                    field: key
                })
            }
        });

        if (errors.length > 0) {
            reject(errors);
        } else {
            resolve(template_data);
        }
    });
};

const create_template = (data) => {
    console.time('/routes/template/create_template');
    return new Promise((resolve, reject) => {

        let sql = squel.insert()
                .into('tb_template')
                .setFields(data)
                .returning('*')
                .toParam();

        db.one(sql.text, sql.values)
                .then(template => {
                    console.timeEnd('/routes/template/create_template');
                    console.log(`Template saved successfully: ${template.template_code}`);
                    resolve(template);
                })
                .catch(err => {
                    console.warn('Error: /routes/template/create_template', err);
                    console.timeEnd('/routes/template/create_template');
                    reject(err);
                });
    });
};

/**
 * @description query to fetch template data from the database
 * @return {object}
 * */
const fetch_templates = () => {
    return squel.select()
            .from('tb_template');
};

/* PRIMARY FUNCTIONS */
/** post_template
 * @param req object
 * @param res object
 * @param next object
 * @description create a new template in the database
 * @return res object
 * */
const post_template = (req, res, next) => {
    console.time('/routes/template/post_template');
    req.wf.data.template_code = generate_token_uuid(req.token.token_id);

    build_template(req)
            .then(create_template)
            .then(template => {
                console.log('Template saved successfully');
                req.wf.message = 'Template saved successfully';
                req.wf.data = template;

                console.timeEnd('/routes/template/post_template');
                console.log(`<### ${req.url} Post template successfully`);
                res.send(req.wf);
            })
            .catch(err => {
                console.warn('Error: /routes/template/post_template', err);

                req.wf.http_code = 500;
                req.wf.message = 'Unable to save template';
                req.wf.errors.push(err);

                console.timeEnd('/routes/template/post_template');
                next(req);
            });
};

/** post_template
 * @param req object
 * @param res object
 * @param next object
 * @description create a new template in the database
 * @return res object
 * */
const put_template = (req, res, next) => {
    res.send({status: 'wip'});
};

/** post_template
 * @param req object
 * @param res object
 * @param next object
 * @description create a new template in the database
 * @return res object
 * */
const patch_template = (req, res, next) => {
    res.send({status: 'wip'});
};

/** post_template
 * @param req object
 * @param res object
 * @param next object
 * @description create a new template in the database
 * @return res object
 * */
const get_template = (req, res, next) => {
    console.time('/routes/template/get_template');

    let sql = fetch_templates();
    sql = sql.toString();

    db.many(sql)
            .then(templates => {
                console.log('Templates found');
                req.wf.message = 'Templates found';
                req.wf.data = templates;

                console.timeEnd('/routes/template/get_template');
                console.log(`<### ${req.url} Get templates found`);
                res.send(req.wf);
            })
            .catch(err => {
                console.warn('Error: /routes/template/get_template');

                req.wf.http_code = 500;
                req.wf.message = 'Unable to find templates';
                req.wf.errors.push(err);

                console.timeEnd('/routes/template/get_template');
                // res.status(req.wf.http_code).send(req.wf);
                next(req);
            });
};

/** delete_template
 * @param req object
 * @param res object
 * @param next object
 * @description marks a template as inactive in the database
 * @return res object
 * */
const delete_template = (req, res, next) => {
    res.send({status: 'wip'});
};

/* EXPORTED FUNCTIONS */
module.exports = {
    // primary
    post_template,
    put_template,
    patch_template,
    get_template,
    delete_template
    // internal
};
