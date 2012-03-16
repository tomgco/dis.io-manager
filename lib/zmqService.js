var EventEmitter = require('events').EventEmitter
  , context = require('zmq')
  , CrudDelegate = require('dis.io-mongo-crud').crud
  ;

exports.createZmqService = function(connection) {
  var zmq = new EventEmitter()
    , sender = context.socket('push')
    , port = 60000
    , address = '*'
    , bindStarted = false
    , crudDelegate = CrudDelegate.createCrudDelegate(connection)
    , idFilter = CrudDelegate.objectIdFilter(connection)
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

  function send(serialisedWorkunit) {
    sender.send('000010');
    sender.send(serialisedWorkunit);
  }

  zmq.send = send;
  return zmq;
};