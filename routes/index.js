// var Task = new Task();

exports.task = {};

exports.task.exists = function(req, res, next) {
  res.send(req.params);
  return next();
};

// exports.