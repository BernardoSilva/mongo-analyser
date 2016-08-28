#!/usr/bin/env node


var Db = require('mongodb').Db,
  MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server;

var exec = require('child_process').exec;
var fs = require('fs');
var ProgressBar = require('progress');


/**
 *
 * @param {String} attributeName
 * @param {Array} parameters
 * @param {String|Number} defaultValue
 * @returns {String|Number}
 */
function getAttribute(attributeName, parameters, defaultValue) {
  var position = parameters.indexOf(attributeName);
  if (position === -1) {
    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }
    throw new Error('Attribute (' + attributeName + ') is required!');
  }

  return parameters[position + 1];
}


var options = {
  dumpDir: getAttribute('--dump-dir', process.argv, 'dump/'),
  host: getAttribute('--host', process.argv, 'localhost'),
  port: getAttribute('--port', process.argv, 27017),
  db: getAttribute('--db', process.argv),
  varietySrc: 'node_modules/variety/variety.js'
};


// Set up the connection to the local db
var mongoclient = new MongoClient(new Server(options.host, options.port), {native_parser: true});

// Open the connection to the server
// mongoclient.connect("mongodb://" + options.host + ":" + options.port + "/" + options.db, {}, function (err, db) {
mongoclient.connect("mongodb://" + options.host + ":" + options.port + "/" + options.db, {}, function (err, db) {
  db.collections(function (err, collections) {
    if (collections.length === 0) {
      throw new Error('No collections found!');
    }
    var bar = new ProgressBar('Processing Collection: :collection :bar :percent', {total: collections.length - 1});
    var timer = setInterval(function () {
      if (bar.complete) {
        console.log('\ncomplete\n');
        clearInterval(timer);
      }
    }, 100);

    var collectionNames = [];
    var collectionName = undefined;
    var currentDate = new Date();
    var dateString = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    for (var i = 0; i < collections.length; i++) {
      collectionName = collections[i].s.name;
      if (typeof collectionName !== 'undefined' && collectionName !== 'system.indexes') {
        collectionNames.push(collectionName);

        if (options.dumpDir.length > 0) {
          if (!fs.existsSync(options.dumpDir)) {
            fs.mkdirSync(options.dumpDir);
          }
        }

        var dumpCommand = 'mongo ' + options.db + ' --eval "var collection =\'' + collectionName + '\'" ' + options.varietySrc + ' >> ' + options.dumpDir + 'variety.dump-' + dateString + '.' + collectionName + '.txt'

        /**
         * Required this to create a new scope in the anonymous function that will be
         * passed to exec as callback.
         */
        var tickBar = function (collectionName) {
          return function () {
            bar.tick({'collection': collectionName});
          }
        }(collectionName);

        // Execute the variety analysis in a child process.
        exec(dumpCommand, tickBar);
      }

    }


  });
  db.close();
});



