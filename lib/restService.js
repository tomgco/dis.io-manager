var restify = require('restify')
  , createCrudDelegate = require('./crudDelegate').createCrudDelegate
  ;

exports.createRestService = function(connection) {
  var server = restify.createServer({
        name: 'disio-manager'
      })
    , crudDelegate = createCrudDelegate(connection)
    ;

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.get('/echo/:name', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  // Rest Service.

  server.get('/task/exists', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  server.post('/task/create', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  server.put('/task/edit', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  server.del('/task/remove', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  return server;
};