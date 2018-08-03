const {format_date} = require('./../extends/utils');

/** @function log_url - logs the url. */
log_url = (req, res, next) => {
    const blue = '\x1b[0;34m';
    const nc = '\x1b[0m';
    console.log(`###> ${req.method} ${blue}${req.url}${nc} ${req.headers['x-api-key']}`);
    next();
};

/** @function build_workflow_object - builds blueprint for the workflow object. */
build_workflow_object = (req, res, next) => {
    let now = new Date();
    req.wf = {
        http_code: 200,
        message: '',
        name: null,
        workflow_id: `${format_date(now)}-${Math.random().toString().split('.')[1]}`,
        counter: 0,
        previous_job: '',
        job: '',
        data: {},
        errors: [],
        workflow: [],
        local_history: {}
    };
    next();
};

module.exports = {
    log_url,
    build_workflow_object
};