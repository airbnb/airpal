/**
 * BaseStore
 */

// Utilities
var _ = require('lodash');
var EventEmitter  = require('events').EventEmitter;

class BaseStore extends EventEmitter {

  constructor() {
    /* - Defaults ------------------------------------------------------------ */

    // The collection holds the data for the store
    this.collection = [];

    // Defines the default comparator for the collection
    // @return {String} the uuid of the model
    this.comparator = 'uuid';
  }

  /* - Selectors ----------------------------------------------------------- */

  // Returns all items in the collection with an optional comparator
  // if no comparator is given, the default one is used
  // @param options {object} the options for this function
  // @return {array} the collection
  all(options) {
    if (this.size() === 0) return [];
    options || (options = {})

    // Return the sorted collection
    if (options.sort) {
      return _.sortBy(this.collection, options.sortBy || this.comparator)
    }
    return this.collection;
  }

  // Get a specific query from the collection
  // @param {integer} the event uuid
  // @return {object/undefined} the query object
  get(uuid) {
    return _.find(this.collection, { uuid: uuid });
  }

  // Filters the collection based on the arguments
  // @param context {Object/Function/Array} the search context
  where(context, options) {
    if (_.isEmpty(context) || this.size() === 0) return [];
    options || (options = {})

    // Filter the collection
    var results = _.where(this.collection, context);

    // Sort the result, if asked
    if (options.sort) {
      return _.sortBy(results, options.sortBy || this.comparator);
    }
    return results;
  }

  // Defines the size of the store collection
  // @return {Integer} the size of the store collection
  size() {
    return _.size(this.collection);
  }

  /* - Modifiers ----------------------------------------------------------- */

  // Simply creates a new object and adds it to the collection. Make absolutely
  // sure we don't got the object
  // @param models {Object} the model object
  // @return {Object} the store
  add(models, options) {
    options || (options = {})

    // Convert a single object to an array
    var singular  = !_.isArray(models);
    models        = singular ? (models ? [models] : []) : _.clone(models)

    // Loop over the array and try to add them to the collection.
    _.each(models, function(model) {
      // Make sure this is a unique item. If there is already a match, fail this.
      var unique = _.find(this.collection, { uuid: model.uuid });
      if (!_.isUndefined(unique)) return;

      // Add the model to the collection
      this.collection.push(model);

      // Emit a store create event, unless the silent param is given
      if (options.silent) return this;
      this.emitChange('add');
    }.bind(this));

    // Return this for chaining purpose
    return this;
  }

  // Updates a model based on the uuid and the new object data
  // @param uuid {String} the uuid of the model
  // @param changedObject {Object} the updated run
  // @return {Object} the run store
  update(uuid, changedObject, options) {
    options || (options = {})

    // Find the correct entry and update it with the new info
    var model = _.find(this.collection, { uuid: uuid });

    // Apply all the data to the object
    model = _.assign(model, changedObject);

    // Remove the old object and add the new one
    this.collection = _.reject(this.collection, { uuid: uuid });
    this.collection.push(model);

    // Emit the update event, unless the silent param is given
    if (options.silent) return this;
    this.emitChange('update');
    return this;
  }

  /* - Events handlers ----------------------------------------------------- */

  // Emit the changes with the eventemitter
  emitChange(eventName, options) {
    this.emit(eventName, options);
  }

  // Creates an event listener for a specific event
  // @param eventName {string} event name to listen to
  // @param callback {function} event callback
  addStoreListener(eventName, callback) {
    this.on(eventName, callback);
  }

  // Removes a specific event listener
  // @param eventName {string} event name to remove
  // @param callback {function} event callback
  removeStoreListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }
}

module.exports = BaseStore;
