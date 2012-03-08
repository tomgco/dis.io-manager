var restify = require('restify')
  , routes = require('../routes')
  ;

exports.createRestService = function(connection) {
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

  // Rest Service.

  server.get('/task/exists', routes.task.exists);

  server.post('/task/create', routes.task.create);

  server.put('/task/edit', routes.task.edit);

  server.del('/task/remove', routes.task.remove);

  return server;
};