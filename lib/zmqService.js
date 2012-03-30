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

  function send(serialisedWorkunit) {
    socket.send('object{"hello":"test","nom":"test","joy":"testttttttttt"}'); // this is the main payload
  }

  socket.on('message', function(data) {
    // switching on the types of messages, utilising the first three bytes
    var header = data.toString('utf-8', 0, 6);
    switch(header) {
      case 'conect':
        // if (manager.getConnected() >= manager.maxDistributors) {
        //   socket.send(header + 'Bad');
        // } else {
        //   manager.incrementConnected();
          socket.send(header + 'Good');
        break;
      case 'object':
        var json = data.toString('utf-8', 6);
        console.log(json);
        break;
      default:
        console.error(new Error('Uknown message passed: ' + header));
    }
  });

  zmq.send = send;
  return zmq;
};