require('console-trace');
console.traceAlways = true;

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
  ;

console.warn('This package depends on a mongodb store.'.red);

var txtRecord = {
    name: 'dis.io manager'
};

// Pubsub for totifing when nodes pop up or down
databaseAdaptor.createConnection(function(connection) {

  var manager = Manager.createManager()
    , zmq = ZmqService.createZmqService(connection, manager)
    ;
  zmq.on('bind', function(info) {
    zmq.send(/* Task.getWorkUnit */);

    var server = RestService.createRestService(connection)
      ;

    server.listen(function() {
      startDiscovery('zmq-manager', info.port, info.zmqVersion);
      startDiscovery('disio-manager', server.address().port, appVersion);
    });

  });
});

function startDiscovery(name, port, version) {
  console.log('Running ' + name + '@'.yellow + appVersion + ' on ' + '0.0.0.0:' + port);
  var ad = mdns.createAdvertisement(mdns.udp(name, appVersion), port, { 'txtRecord': txtRecord });
  ad.start();
}