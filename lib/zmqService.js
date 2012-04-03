var EventEmitter = require('events').EventEmitter
  , context = require('zmq')
  ;

exports.createZmqService = function(manager) {
  var zmq = new EventEmitter()
    , socket = context.socket('rep')
    , port = 60000
    , address = '*'
    , bindStarted = false
    , timeout = 2500
    ;

  socket.identity = 'manager-pub' + process.pid;

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
      socket.bind('tcp://' + address + ':' + port, function(err) {
        bind(err, cb);
      });
    } else {
      cb && cb();
    }
  }

  function send(obj) {
    socket.send(JSON.stringify(obj)); // this is the main payload
  }

  socket.on('message', function(buf) {
    // switching on the types of messages, utilising the first three bytes
    var data = JSON.parse(buf.toString());
    if (data.action === 'requestWorkunit') {
      send({'type': 'workunit', 'data': manager.getCompiledWorkUnit()});
    } else {
      console.error(new Error('Uknown message passed: ' + buf.toString()));
    }
  });

  zmq.send = send;
  return zmq;
};