// var Task = new Task();

exports.task = {};


exports.task.exists = function(req, res, next) {
  res.send(req.params);
  return next();
};

exports.task.create = function(req, res, next) {
  res.send(req.params);
  return next();
};

exports.task.edit = function(req, res, next) {
  res.send(req.params);
  return next();
};

exports.task.remove = function(req, res, next) {
  res.send(req.params);
  return next();
};

  // server.get('/task/exists', routes.task.exists);

  // server.post('/task/create', routes.task.create);

  // server.put('/task/edit', routes.task.edit);

  // server.del('/task/remove', routes.task.remove);
// exports.