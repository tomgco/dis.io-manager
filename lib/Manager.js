var EventEmitter = require('events').EventEmitter
  , CrudDelegate = require('dis.io-mongo-crud').crud
  ;
/**
 *  The main manager class to get a task and the break down its payloads
 */

exports.createManager = function(connection, id) {
  var self = new EventEmitter()
    , maxDistributors = 0
    , connected = {}
    , payloads = []
    , workunits = []
    , crudDelegate
    , collection
    , distributorTimeout = 15000
    , workunit = ''
    , idFilter
    ;

  // Start database connection and load the table task
  connection.collection('task', function(error, loadedCollection) {
    collection = loadedCollection;
    crudDelegate = CrudDelegate.createCrudDelegate(collection);
    idFilter = CrudDelegate.objectIdFilter(connection);
    init();
  });

  function init() {
    hasTask(); // check if task exists
  }

  function hasTask() {
    // check if task was passed in via commandline, else do request to database or trow error.
    if (id !== undefined) {
      getTask();
    } else {
      throw new Error('Task ID must be passed via the command line');
    }
    return false;
  }

  // Gets a task from the database based on the id supplied in the command line.
  function getTask() {
    crudDelegate.findById(idFilter(id), function(err, entity) {
      if (!err) {
        setupManager(entity);
      }
    });
  }

  // Set up the manager, assign varibles and process the payloads into a usuable array.
  function setupManager(entity) {
    maxDistributors = entity.NumberOfWorkers;
    processPayload(JSON.parse(entity.Payload), function(processedPayloads) {
      payloads = processedPayloads;
      self.emit('ready');
    });
    workunit = entity.Workunit;
  }

  // Function to check if a distributor is allowed to connect based on how many are currently connected.
  function allowedToConnect(id) {
    if (connected[id] || Object.keys(connected).length < maxDistributors) {
      return true;
    }
    return false;
  }

  function getConnected(amount) {
    return connected;
  }

  // Remove stale connections, this will free up spaces if a distrbiutor dies and doesn't notify the manager.
  function purgeOldConnections() {
    Object.keys(connected).forEach(function(key, index) {
      if ((connected[key] + distributorTimeout) < +Date.now()) {
        delete connected[key];
        console.log('Removing ' + key + ' - Timed out - ' + (maxDistributors - Object.keys(connected).length) + ' spaces');
      }
    });
  }

  // return the work unit, here would occur any modification to the source such as
  // code minification.
  function getCompiledWorkUnit() {
    // TODO: check if it is javascript
      // minify if it is.
      // prepend Communication.js to it
    return workunit;
  }

  // Check to see if a payload needs to be broken down.
  function processPayload(payload, cb) {
    if (typeof payload === 'array') {
      cb(payload);
    } else if (typeof payload === 'object') {
      // build payloads from meta.
      buildPayload(payload, cb);
    }
  }

  /**
   *  Builds the payload based on a criteria.
   * At the moment this only works on a range, with only being one level deep.
   * For a more complex / larger payloads pre build using the tool found within the client's example/wu/build-pi.js
   */
  function buildPayload(payload, cb) {
    var completed = [];
    for (var i = 0; i < maxDistributors; i++) {
      completed[i] = [];
    }
    console.time('buildPayload');
    Object.keys(payload).forEach(function(key, index, array) {
      var value = payload[key];
      if (typeof value === 'string') {
        switch (true) {
          // is range so break up and run
          case /-/.test(value):
            delete payload[key]; // remove key so not re-added when merging static keys
            var range = value.split('-', 2);
            var arrayLength = range[1] - Array(+range[1]).splice(0, range[0]).length;
            var amount = Array(+arrayLength).length;
            for (var i = 0; i < amount + 1; i++) {
              var newPayload = {};
              newPayload[key] = +range[0] + i;
              var keys = Object.keys(payload);
              for (var j = 0; j < keys.length; j++) {
                newPayload[keys[j]] = payload[keys[j]];
              }
              completed[i % maxDistributors].push(newPayload);
            }
            break;
          default:
            completed.push(payload);
        }
      }
      if (index === array.length - 1) {
        console.timeEnd('buildPayload');
        cb(completed);
      }
    });
  }

  function getPayloads(i) {
    return payloads[i];
  }

  self.on('ready', function() {
    // here is where I will remove old / stale distributors after x amount of time.
    var distributorCheck = setInterval(purgeOldConnections, distributorTimeout);
  });

  self.getPayloads = getPayloads;
  self.getCompiledWorkUnit = getCompiledWorkUnit;
  self.connected = connected;
  self.allowedToConnect = allowedToConnect;
  self.getConnected = getConnected;
  self.getMaxDistributors = function() {
    return maxDistributors;
  };
  self.getId = function(){return id;};
  self.connection = connection;
  return self;
};