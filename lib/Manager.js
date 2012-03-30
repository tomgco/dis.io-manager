var EventEmitter = require('events').EventEmitter
  , CrudDelegate = require('dis.io-mongo-crud').crud
  ;

exports.createManager = function(connection, id) {
  var self = new EventEmitter()
    , maxDistributors = 0
    , connected = {}
    , payloads = []
    , workunits = []
    , crudDelegate
    , collection
    , distributorTimeout = 5000
    ;

  connection.collection('task', function(error, loadedCollection) {
    collection = loadedCollection;
    crudDelegate = CrudDelegate.createCrudDelegate(collection);
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

  function getTask() {
    crudDelegate.findById(id, function(err, entity) {
      if (!err) {
        setupManager(entity);
      }
    });
  }

  function setupManager(entity) {
    maxDistributors = entity.NumberOfWorkers;
    payloads.push(JSON.parse(entity.Payload));
    self.emit('ready');
  }

  function allowedToConnect(id) {
    if (connected[id] || Object.keys(connected).length < maxDistributors) {
      return true;
    }
    return false;
  }

  function getConnected(amount) {
    return connected;
  }

  function purgeOldConnections() {
    //TODO: here is where I will remove old / stale distributors after x amount of time.
    Object.keys(connected).forEach(function(key, index) {
      if ((connected[key] + distributorTimeout) < +Date.now()) {
        delete connected[key];
        console.log('Removing ' + key + ' - Timed out - ' + (maxDistributors - Object.keys(connected).length) + ' spaces');
      }
    });
  }

  self.on('ready', function() {
    // TODO: cleanup after a new task has been got.
    var distributorCheck = setInterval(purgeOldConnections, distributorTimeout);
  });

  // // Should be done as soon as one is avaible instead of having to have all to move on. NON BLOCKING
  // function availbleDistributors() {
  //   // if can contact registry
  //    // use these
  //   // else use bonjour

  //   // if some are avalible
  //     // for each
  //       // check if it is active if true then partially allocate
  //       // if not enough queue the next avalible to join this manager
  //       //  by lisening to new subscribes to the registry or bonjour
  //   // else
  //     // wait till one bocomes availble, maybe spawn one
  // }
  // self.decrementConnected = decrementConnected;
  // self.incrementConnected = incrementConnected;
  self.connected = connected;
  self.allowedToConnect = allowedToConnect;
  self.getConnected = getConnected;
  self.maxDistributors = maxDistributors;
  return self;
};