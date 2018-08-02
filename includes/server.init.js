/** @function log_url - logs the url. */
log_url = (req, res, next) => {
    const blue = '\x1b[0;34m';
    const nc = '\x1b[0m';
    console.log(`${req.method} ${blue}${req.url}${nc}`);
    next();
};

/** @function build_workflow_object - builds blueprint for the workflow object. */
build_workflow_object = (req, res, next) => {

    req.workflow = {
        http_code: 200,
        message: '',
        name: null,
        workflow_id: new Date().getTime().toString() + Math.random() * (1),
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