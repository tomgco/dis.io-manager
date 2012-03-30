require('console-trace');
// console.traceAlways = true; // Uncomment to show line numbers with every console.log(); call

var colors = require('colors')
  , properties = require('./properties')
  , mongoDelegate = require('dis.io-mongo-crud')
  , databaseAdaptor = mongoDelegate.database.createDatabaseAdaptor(properties.database)
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = 'v' + packageJSON.version.split('.').slice(0, -1).join('-')
  , RestService = require('./lib/restService')
  , ZmqService = require('./lib/zmqService')
  , Manager = require('./lib/manager')
  , availability = require('availability')
  ;
console.warn('This package depends on a mongodb store.'.red);

/**
 *  On connection to DB start by getting ID and then starting, this is the main work horse
 */
databaseAdaptor.createConnection(function(connection) {

  var manager = Manager.createManager(connection, getTaskIdFromCLI())
    ;
  manager.on('ready', function() {
    var zmq = ZmqService.createZmqService(manager);
    zmq.on('bind', function(info) {
      var server = RestService.createRestService(connection)
        , config = {
          // override the reply from availability ;]
          onConnection: function(socket) {
            socket.on('data', function(buf) {
              var uniqueId = socket.remoteAddress + '-' + buf.toString()
                , allowed = manager.allowedToConnect(uniqueId)
                ;

              if (allowed) {
                manager.connected[uniqueId] = +Date.now();
              }
              socket.write(allowed.toString());
            });
          }
        }
        , availabilityServer = availability.createServer(config)
        ;

      setTimeout(function() {zmq.send(/* Task.getWorkUnit */);}, 4000); // wait until the required distributors are up befor starting.
      server.listen(function() {
        startDiscovery('disio-manager', server.address().port, appVersion, info, availabilityServer);
      });
    });
  });
});

/**
 *  Starts the Bonjour / zeroconf service for advertising up services
 *  and logs them
 */
function startDiscovery(name, port, version, info, availabilityServer) {
  console.log('Running ' + name + '@'.yellow + appVersion + ' on ' + '0.0.0.0:' + port);
  console.log('Running zmq-' + name + '@'.yellow + appVersion + ' on ' + '0.0.0.0:' + info.port);
  console.log('Running availability-server' +'@'.yellow + appVersion + ' on ' + '0.0.0.0:' + availabilityServer.address().port);
  var ad = mdns.createAdvertisement(mdns.udp(name, appVersion), port, { 'txtRecord': {
          name: 'dis.io manager'
        , zmqPort: info.port
        , zmqVersion: info.zmqVersion
        , availabilityPort: availabilityServer.address().port
      }
    });
  ad.start();
}

// helper utility to get things started.
function getTaskIdFromCLI() {
  var index = process.argv.indexOf('--id') + 1;
  return process.argv[index];
}