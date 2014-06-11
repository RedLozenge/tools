'use strict'

/**
 * Javascript class to interact with a Parse application's logs.
 */

var assert = require('assert');
var _ = require('underscore');
var Parse = require('parse').Parse;
var request = require('request');

var ParseLogger = function(applicationId,
                           masterKey) {

    var parseLogAPI = 'https://api.parse.com/1/scriptlog';
    var tailDelay = 4000;

    function generateStarTimeJSON(date) {
        assert(date, '"date" is a required parameter');

        if (_.isString(date)) {
            date = new Date(date).toISOString();
        } else {
            date = date.toISOString();
        }

        return JSON.stringify(
            {
                'iso':    date,
                '__type': 'Date'
            }
        );
    }

    /**
     * Log messages from Parse look like:
     * {
     *     timestamp: {
     *         __type: 'Date',
     *         iso: '2014-06-10T21:03:24.877Z'
     *     },
     *     message: 'I2014-06-10T21:03:24.877Z] blah blah blah'
     * }
     */
    function parseDateFromMessage(message) {
        var dateString = message.timestamp.iso;
        var date = new Date(dateString);
        return date;
    }

    function printMessages(messages) {
        if (!_.isArray(messages)) {
            messages = [ messages ];
        }

        for (var i in messages) {
            console.log(messages[i].message);
        }
    }

    this.fetchLog = function(startTime, lines, level) {
        var requestParameters = {};

        if (lines === undefined) {
            lines = 10;
        }
        if (level === undefined) {
            level = 'INFO';
        }

        assert(_.isNumber(lines) && lines > 0,
               '"lines" must be a number greater than 0');
        assert(level === 'INFO' || level === 'ERROR',
               '"level" must be INFO or ERROR');

        if (startTime) {
            requestParameters.startTime = generateStarTimeJSON(startTime);
        }
        requestParameters.n = lines;
        requestParameters.level = level;

        var promise = new Parse.Promise();

        request.get(
            {
                url: parseLogAPI,
                method: 'GET',
                headers: {
                    'X-Parse-Application-Id': applicationId,
                    'X-Parse-Master-Key':     masterKey
                },
                qs: requestParameters
            },
            function(error, response, body) {
                if (response.statusCode === 200) {
                    var messages = {};
                    try {
                        messages = JSON.parse(body);
                    } catch (e) {
                        console.error('Invalid response:\n' + body);
                    }
                    // reverse messages to place them in chronological order
                    messages.reverse();
                    promise.resolve(messages);
                } else {
                    promise.reject('HTTP error: ' + response.statusCode + '\n\n' + body);
                }
            }
        );

        return promise;
    }

    this.tailLog = function(startTime, lines) {
        // Set up a higher scope variable since setInterval doesn't play nice
        // with parameters
        var lastTailStartTime = startTime;
        var self = this;

        function loopableTail() {
            self.fetchLog(lastTailStartTime, lines).then(
                function(messages) {
                    if (messages.length > 0) {
                        // grab the last time in the messages to use as the new
                        // startTime
                        var nextDate = parseDateFromMessage(
                                        messages[messages.length - 1]);
                        lastTailStartTime = nextDate.toISOString();
                        printMessages(messages);
                    }
                }
            );
        }

        var tailInternval = setInterval(loopableTail, tailDelay);
    }
}

module.exports = ParseLogger;
