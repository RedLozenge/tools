#!/usr/local/bin/node

var ParseLogger = require('../lib/parse-logger');
var assert = require('assert');

var DEFAULT_LINES = 10;

/**************************************
 * Configuration
 */

var yargs = require('yargs')
    .usage('usage: $0 [application id] [master key] [OPTIONS]')
    .alias('t', 'tail')
    .describe('t', 'continuously tail log')
    .default('n', DEFAULT_LINES)
    .describe('n', 'display last COUNT lines of log')
    .alias('h', 'help')
    .describe('h', 'display this usage message');

var argv = yargs.argv;

var applicationId = argv._[0];
var masterKey = argv._[1];
var tail = argv.t;
var count = argv.n;
var level = 'INFO';

// Grab application configuration from the environment if available
if (process.env.PARSE_APPLICATION_ID) {
    applicationId = process.env.PARSE_APPLICATION_ID;
}
if (process.env.PARSE_MASTER_KEY) {
    masterKey = process.env.PARSE_MASTER_KEY;
}

/**************************************
 * Error checking
 */

if (argv.h) {
    console.log(yargs.help());
    process.exit();
}

assert(applicationId, 'application id required');
assert(masterKey, 'master key required');

// Cleanly exit on CTRL-C
process.on('SIGINT', function() {
    process.exit();
});

/**************************************
 * Main
 */

var logger = new ParseLogger(applicationId, masterKey);

if (tail) {
    logger.tailLog(null, count);
} else {
    logger.fetchLog(null, count, level).then(
        function(messages) {
            for (var i in messages) {
                console.log(messages[i].message);
            }
        }
    );
}
