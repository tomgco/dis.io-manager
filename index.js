var colors = require('colors')
  , properties = require('./properties')
  , databaseAdaptor = require('./lib/database').createDatabaseAdaptor(properties.database)
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = 'v' + packageJSON.version.split('.').slice(0, -1).join('-')
  , RestService = require('./lib/restService')
  ;

console.warn('This package depends on a mongodb store.'.red);

var txtRecord = {
    name: 'dis.io manager'
  , taskId: Number
};

// Pubsub for totifing when nodes pop up or down

databaseAdaptor.createConnection(function(connection) {

  var server = RestService.createRestService(connection);

  server.listen(function() {
    console.log('Running as ' + 'disio-manager' + '@'.yellow + appVersion + ' at ' + server.address().address + ':' + server.address().port);
    var ad = mdns.createAdvertisement(mdns.udp('disio-manager', appVersion), server.address().port, { 'txtRecord': txtRecord });
    ad.start();
  });
});