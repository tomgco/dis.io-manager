var EventEmitter = require('events').EventEmitter
  ;

exports.createManager = function() {
  var self = new EventEmitter()
    , maxDistributors = 1
    ;

  function hasTask() {
    // check if task was passed in via commandline, else do request to database.
    return false;
  }

  function getTask() {

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
  self.maxDistributors = maxDistributors;
  return self;
};