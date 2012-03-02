var colors = require('colors')
  , properties = require('./properties')
  , databaseAdaptor = require('./lib/database').createDatabaseAdaptor(properties.database)
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = 'v' + packageJSON.version.split('.').slice(0, -1).join('-')
  , restify = require('restify')
  , routes = require('./routes')
  ;

console.warn('This package depends on a mongodb store.'.red);

var txtRecord = {
    name: 'dis.io manager'
  , taskId: Number
};

var server = restify.createServer({
  name: 'disio-manager'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.get('/task/exists', routes.task.exists);

databaseAdaptor.createConnection(function(connection) {
  server.listen(function() {
    console.log('Running as ' + 'disio-manager' + '@'.yellow + appVersion + ' at ' + server.address().address + ':' + server.address().port);
    var ad = mdns.createAdvertisement(mdns.udp('disio-manager', appVersion), server.address().port, { 'txtRecord': txtRecord });
    ad.start();
  });
});