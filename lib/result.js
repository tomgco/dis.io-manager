var CrudDelegate = require('dis.io-mongo-crud').crud
  ;

exports.save = function(entity, connection, cb) {
  var crudDelegate
    , collection
    ;

  connection.collection('result' + entity.workunitId, function(error, loadedCollection) {
    collection = loadedCollection;
    crudDelegate = CrudDelegate.createCrudDelegate(collection);
    crudDelegate.create(entity, cb);
  });
};