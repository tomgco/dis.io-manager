var EventEmitter = require('events').EventEmitter
  , context = require('zmq')
  ;

exports.createZmqService = function(connection) {
  var zmq = new EventEmitter()
    , sender = context.socket('push')
    , port = 60000
    , address = '0.0.0.0'
    , bindStarted = false
    ;

  bind(false, function() {
    zmq.emit('bind', {
        port: port
      , zmqVersion: context.version
      , address: address
    });
  });

  function bind(err, cb) {
    if (!bindStarted || (err instanceof Error)) {
      if (err) {
        port++;
      }
      bindStarted = true;
      sender.bind('tcp://' + address + ':' + port, function(err) {
        bind(err, cb);
      });
    } else {
      cb && cb();
    }
  }

  function send() {

  }

  zmq.send = send;
  return zmq;
};