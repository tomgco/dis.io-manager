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

// Pubsub for totifing when nodes pop up or down
databaseAdaptor.createConnection(function(connection) {

  var manager = Manager.createManager()
    , zmq = ZmqService.createZmqService(connection, manager)
    ;
  zmq.on('bind', function(info) {
    zmq.send(/* Task.getWorkUnit */);
    var server = RestService.createRestService(connection)
      , availabilityServer = availability.createServer()
      ;

    server.listen(function() {
      startDiscovery('disio-manager', server.address().port, appVersion, info, availabilityServer);
    });

  });
});

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