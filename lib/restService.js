var restify = require('restify')
  , CrudDelegate = require('dis.io-mongo-crud').crud
  ;

exports.createRestService = function(connection) {
  var server = restify.createServer({
        name: 'disio-manager'
      })
    , crudDelegate = CrudDelegate.createCrudDelegate(connection)
    , idFilter = CrudDelegate.objectIdFilter(connection)
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
    /**
     *  @todo FIX query
     */
    var query = {};
    crudDelegate.findOne(query, {}, function(err, data) {
      if (err) {
        res.send(false);
      } else {
        res.send(true);
      }
    });
    return next();
  });

  server.post('/task/create', function (req, res, next) {
    crudDelegate.create(req.params, function (err, data) {
      if (err) {
        res.send(false);
      } else {
        res.send(true);
      }
    });
    return next();
  });

  server.put('/task/edit', function (req, res, next) {
    var id = idFilter(req.params.id)
      ;
    delete req.params.id;

    crudDelegate.update(id, req.params, function (err, data) {
      if (err) {
        res.send(false);
      } else {
        res.send(true);
      }
    });
    return next();
  });

  server.del('/task/remove', function (req, res, next) {
    var id = idFilter(req.params.id)
      ;

    crudDelegate.deleteById(id, function (err, data) {
      if (err) {
        res.send(false);
      } else {
        res.send(true);
      }
    });
    return next();
  });

  return server;
};