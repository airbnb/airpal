var ExecutionHistory = require('./models').ExecutionHistory,
    url = require('url'),
    _ = require('lodash'),
    Fqn = require('./fqn'),
    EventEmitter = require('events').EventEmitter;

function QueryHistoryComponent(executionHistory) {
  this._history = executionHistory;
  this._emitter = new EventEmitter();
  this._filters = [];
}

_.extend(QueryHistoryComponent.prototype, {
  on: function() {
    return this._emitter.on.apply(this._emitter, slice.call(arguments, 0));
  },
  render: function() {
    var qs, _url;
    qs = _.isEmpty(this._filters) ? null : _.map(this._filters, function(filter) {
      return ['table', filter].join('=');
    }).join('&');
    _url = ['/api/query/history', qs].join('?');

    $.ajax({
      url: _url,
      type: 'GET',
      error: function() {},
      success: _.bind(function(res) {
        this._history.replace(_.uniq(res, false, function(el) {
          return el.uuid;
        }));
      }, this)
    });
  },
  addFilter: function(schema, table) {
    var fqn = Fqn.toFqn(schema, table);
    this._filters = _.uniq(this._filters.concat(fqn));
    this.render();
  },
  removeFilter: function(schema, table) {
    var fqn = Fqn.toFqn(schema, table);
    this._filters = _.without(this._filters, fqn);
    this.render();
  }
});

module.exports = {
  QueryHistoryComponent: QueryHistoryComponent
};
