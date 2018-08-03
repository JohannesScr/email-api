/* declare */
const squel = require('squel').useFlavour('postgres');
const {db} = require('./../../database/database');
/* HELPER FUNCTIONS */


/* SECONDARY FUNCTIONS */

/* PRIMARY FUNCTIONS */

/** @function post_token
 * @param req request object
 * @param res response object
 * @description create a new token entry in the database
 * @return res object
 * */
const post_token = (req, res) => {
    res.send({status: 'wip'});
};

/** @function put_token
 * @param req request object
 * @param res response object
 * @description update a complete token entry in the database
 * @return res object
 * */
const put_token = (req, res) => {
    res.send({status: 'wip'});
};

/** @function patch_token
 * @param req request object
 * @param res response object
 * @description update partial complete token entry in the database
 * @return res object
 * */
const patch_token = (req, res) => {
    res.send({status: 'wip'});
};

/** @function get_token
 * @param req request object
 * @param res response object
 * @description fetch token entry(ies) from the database
 * @return res object
 * */
const get_token = (req, res) => {
    console.time('routes/token/get_token');

    let sql = squel.select()
            .from('tb_token')
            .toString();

    db.many(sql)
            .then(tokens => {
                console.log('Tokens found successfully');
                req.wf.message = 'Tokens found successfully';
                req.wf.data = tokens;

                console.timeEnd('routes/token/get_token');
                console.log('<### get_token');
                res.send(req.wf);
            })
            .catch(err => {
                console.warn('Error: routes/token/get_token:', err);

                req.wf.http_code = 404;
                req.wf.message = 'Unable to find tokens';
                req.wf.errors.push({
                    message: 'Unable to find tokens',
                    error: err
                });

                console.timeEnd('routes/token/get_token');
                console.log('<### Error: get_token');
                res.status(req.wf.http_code).send(req.wf);
            });
};


/* EXPORTED FUNCTIONS */
module.exports = {
    post_token,
    put_token,
    patch_token,
    get_token
};