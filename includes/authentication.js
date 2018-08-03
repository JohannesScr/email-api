const squel = require('squel').useFlavour('postgres');

const {db} = require('./../database/database');

/* HELPER FUNCTIONS */


/* SECONDARY FUNCTIONS */

/**
 * @param req
 * @param res
 * @param next
 * @return
 * */
const verify_token = (req, res, next) => {
    // find the token in the database
    let sql = squel.select()
            .from('tb_token')
            .where('api_key =?', req.headers['x-api-key'])
            .toParam();

    db.one(sql.text, sql.values)
            .then(token => {
                const blue = '\x1b[0;34m';
                const nc = '\x1b[0m';
                console.log(`###> ${req.method} ${blue}${token.api_name}${nc} ${blue}${req.url}${nc}`);

                req.token_code = token.token_code;
                req.api_name = token.api_name;
                next();
            })
            .catch(err => {
                console.warn('Error: Unable to find token or too duplicate token', err);
                req.wf.http_code = 401;
                req.wf.message = 'Unauthorised token is incorrect';
                next(req);
            });
};

/**
 * @param req
 * @param res
 * @param next
 * @return
 * */
const verify_headers = (req, res, next) => {
    let fields = ['x-api-key'];
    let pass = true;

    fields.forEach(field => {
        if(!req.headers.hasOwnProperty(field)) {
            pass = false;
        }
    });

    if (pass) {
        verify_token(req, res, next);
    } else {
        console.warn('Error: Request unauthorized with incorrect headers');
        req.wf.http_code = 401;
        req.wf.message = 'Please check that your request headers are correct';
        next(req);
        // return res.status(req.wf.http_code).send(req.wf);
    }
};

/* PRIMARY FUNCTIONS */
function check (req, res, next) {
    verify_headers(req, res, next);
}

/* EXPORTED FUNCTIONS */
module.exports = {
    check
};