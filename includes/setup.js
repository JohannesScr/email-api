// read config and initialise the environmental variables
let config = require('./config.json');

function setup () {
    const env = process.env.NODE_SERVER_ENV || "development";

    config = config[env];

    console.log(`########## environment: ${env}`);
    Object.keys(config).forEach(key => {
        process.env[key] = config[key];
    });
}

module.exports = {
    setup
};