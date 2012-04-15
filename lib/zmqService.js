var EventEmitter = require('events').EventEmitter
  , context = require('zmq')
  , result = require('./result')
  ;

exports.createZmqService = function(manager) {
  var zmq = new EventEmitter()
    , socket = context.socket('rep')
    , port = 60000
    , address = '*'
    , bindStarted = false
    , timeout = 2500
    , totalNoOfReqs = 0
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
    // switching on the types of messages
    var message = JSON.parse(buf.toString());
    switch (message.action) {
      case 'requestWorkunit':
        send({'action': 'workunit', 'id': manager.getId(), 'workunit': manager.getCompiledWorkUnit(), 'payloads': manager.getPayloads((totalNoOfReqs % manager.getMaxDistributors()))});
        totalNoOfReqs++;
        break;
      case 'completed':
        // save the result set.
        // manager.saveResult(message);
        result.save(message, manager.connection, function(err) {
          send({'action': 'saved', 'data': message});
        });
        break;
      default:
        console.error(new Error('Uknown message passed: ' + buf.toString()));
        break;
    }
    console.log('message: ' + buf.toString());
  });

  zmq.send = send;
  return zmq;
};