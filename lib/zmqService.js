var EventEmitter = require('events').EventEmitter
  , context = require('zmq')
  , CrudDelegate = require('dis.io-mongo-crud').crud
  ;

exports.createZmqService = function(connection, manager) {
  var zmq = new EventEmitter()
    , socket = context.socket('rep')
    , port = 60000
    , address = '*'
    , bindStarted = false
    , crudDelegate = CrudDelegate.createCrudDelegate(connection)
    , idFilter = CrudDelegate.objectIdFilter(connection)
    , connected = 0
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

  function send(serialisedWorkunit) {
    // setInterval(function() {);}, 250);
    // handshake.send('000010'+Math.random());
    // socket.send(serialisedWorkunit);
  }

  socket.on('message', function(data) {
    // switching on the types of messages, utilising the first three bytes
    var header = data.toString('utf-8', 0, 6);
    switch(header) {
      case 'beat..':
        console.log('heartbeat');
        socket.send(data.toString() + 'beat');
        break;
      case 'conect':
        if (connected >= manager.maxDistributors) {
          socket.send(header + 'Bad');
        } else {
          connected++;
          socket.send(header + 'Good');
        }
        break;
      case 'object':
        var json = data.toString('utf-8', 7);
        console.log(json);
        break;
      default:
        console.error(new Error('Uknown message passed: ' + header));
    }
  });

  zmq.send = send;
  return zmq;
};