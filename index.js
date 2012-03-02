var colors = require('colors')
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = 'v' + packageJSON.version.split('.').slice(0, -1).join('-')
  ;

var txtRecord = {
    name: 'dis.io manager'
  , taskId: Number
};

var restify = require('restify');

var server = restify.createServer({
  name: 'manager',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(function() {
  console.log('Running as disio-manager@' + appVersion);
  var ad = mdns.createAdvertisement(mdns.udp('disio-manager', appVersion), server.address().port, { 'txtRecord': txtRecord });
  ad.start();
});