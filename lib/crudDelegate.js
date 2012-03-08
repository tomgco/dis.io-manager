var Pipe = require('piton-pipe')
  // , emptyFunction = function() {}
  // , proxyFunction = function(value) { return value; }
  , EventEmitter = require('events').EventEmitter
  ;

module.exports.createCrudDelegate = function(collection, optional /* {logger, ... } */) {
  optional = optional || {};

  var self = new EventEmitter()
    , validationError = this.validationError
    , logger = optional.logger || console
    ;

  // Ensure that we have some form of logger


  function create(entityObject, options, callback) {

    // use arguments object.
    // if ((typeof options === 'function') && (callback === undefined)) {
    //   callback = options;
    //   options = {};
    // }

    var errors
      , pipe = Pipe.createPipe()
      ;

    pipe
      .add(function() {
        // validation
      })
      .run(function(error, entity) {
        if (error) {
          return callback(error, entityObject);
        }
        collection.insert(entity, { safe: true }, function(error, returenedEntity) {
          if (error === null) {
            self.emit('onCreate', returenedEntity);
            callback(null, returenedEntity[0]);
          } else {
            callback(error, entityObject);
          }
        });
      });
  }

  function read(id, callback) {
    var query = {};
    collection.findOne(query, function(errors, entity) {
      if (errors) {
        callback(errors, null);
      } else if (entity === undefined) {
        callback(new Error('Not in Range'));
      } else {
        callback(null, entity);
      }
    });
  }

  function update(id, entity, options, callback) {

    // use arguments object.
    // if ((typeof options === 'function') && (callback === undefined)) {
    //   callback = options;
    //   options = {};
    // }

    var errors
      ;

    collection.findAndModify({}, [[id, 'asc']], { $set : entity }, { 'new': true }, function (error, returnEntity) {
      if (error === null) {
        self.emit('onUpdate', returnEntity);
        callback(null, returnEntity);
      } else {
        // Return the same object that was passed in, so the user can see problems.
        callback(error, entity);
      }
    });
  }

  function deleteByQuery(query, callback) {
    // use arguments object.
    // if ((typeof options === 'function') && (callback === undefined)) {
    //   callback = options;
    //   options = {};
    // }
    collection.remove(query, function (error, data) {
      if (error) {
        callback(error, null);
      } else {
        self.emit('onDelete', data);
        callback(null, data);
      }
    });
  }

  function deleteById(id, callback) {
  }

  function count(query, callback) {
    collection.count(query, function(error, count) {
      callback(error, count);
    });
  }

  /**
   * Returns a collection of entities
   *
   * You can omit the options parameter and just pass find(query, callback)
   *
   * @param {Object} query What to find
   * @param {Object} options How to manage the results set. See https://github.com/christkv/node-mongodb-native for full options
   * @param {Function} callback Called with the results or error callback(error, dataSet)
   */
  function find(query, options, callback) {

    // use arguments object.
    // if ((typeof options === 'function') && (callback === undefined)) {
    //   callback = options;
    //   options = {};
    // }

    collection.find(query, options).toArray(function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
    });
  }

  /**
   * Returns first entity
   *
   * You can omit the options parameter and just pass findOne(query, callback)
   *
   * @param {Object} query What to findOne
   * @param {Object} options How to manage the results set. See https://github.com/christkv/node-mongodb-native for full options
   * @param {Function} callback Called with the result or error callback(error, data)
   */
  function findOne(query, options, callback) {
    // use arguments object.
    // if ((typeof options === 'function') && (callback === undefined)) {
    //   callback = options;
    //   options = {};
    // }

    find(query, options, function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, data.toArray()[0]);
      }
    });
  }

  self.create = create;
  self.read = read;
  self.update = update;
  self.deleteByQuery = deleteByQuery;
  self.delete = deleteById;
  self.find = find;
  self.findOne = findOne;
  self.count = count;

  return self;
};

module.exports.objectIdFilter = function(connection) {
  return function(id) {
    return new connection.bson_serializer.ObjectID(id);
  };
};