// Proper way to initialize and share the Database object
const {setup} = require('./../includes/setup');

// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

// setup environmental variables
setup();

// create database connection string
const cn = `postgres://${process.env.PG_DB_USERNAME}:${process.env.PG_DB_PASSWORD}@${process.env.PG_DB_HOST}:${process.env.PG_DB_PORT}/${process.env.PG_DB_NAME}`;
// cn = `postgres://johannesscr:johannesscr@localhost:5432/email-api`;

// test for a valid connection string
const db_regex = /undefined/;
if (db_regex.test(cn)) {
    console.warn('No database connection');
    process.exit(1);
}
// console.log('db:', cn);

// Creating a new database instance from the connection details:
const db = pgp(cn);

// Exporting the database object for shared use:
module.exports = {
    db
};