var http = require('http')
  , mdns = require('mdns')
  , EventEmitter = require('events').EventEmitter
  ;

exports.createManager = function() {
  var self = new EventEmitter()
    ;

  function hasTask() {
    return false;
  }

  // // Should be done as soon as one is avaible instead of having to have all to move on. NON BLOCKING
  // function availbleDistributors() {
  //   // if can contact registry
  //    // use these
  //   // else use bonjour

  //   // if some are avalible
  //     // for each
  //       // check if it is active if true then partially allocate
  //       // if not enough queue the next avalible to join this manager
  //       //  by lisening to new subscribes to the registry or bonjour
  //   // else
  //     // wait till one bocomes availble, maybe spawn one
  // }


};