var MongoDb = require('mongodb').Db
  , MongoConnection = require('mongodb').Connection
  , MongoServer = require('mongodb').Server
  ;

module.exports.createDatabaseAdaptor = function(options) {
  options = options || {};
  options.host = options.host || 'localhost';
  options.port = options.port || MongoConnection.DEFAULT_PORT;

  var serverData
    , db
    ;

  serverData = new MongoServer(options.host, options.port, { auto_reconnect: true });

  db = new MongoDb(options.name, serverData);

  function createConnection(cb) {

    // connecting

    db.open(function(error, connection) {
      if (error) {
        // error
        if (error === 'connection already opened') {
          cb(db);
        } else {
          throw new Error("Elp");
          // handle with no database, by queung?
        }
      } else {
        // connected
        cb(connection);
      }
    });
  }

  return {
    createConnection: createConnection,
    db: db
  };
};