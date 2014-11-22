var EventEmitter = require("events").EventEmitter,
    _ = require('lodash'),
    Fqn = require('./fqn'),
    validFqnPart = Fqn.validFqnPart,
    slice = Array.prototype.slice;

function TableSelection() {
  this._emitter = new EventEmitter();
  this._activeTable = null;
  this._activeSchema = null;
}

_.extend(TableSelection.prototype, {
  on: function() {
    return this._emitter.on.apply(this._emitter, slice.call(arguments, 0));
  },
  setActiveFqn: function(fqn) {
    var fqnParts;

    if (fqn == null) {
      return this.setActive(null, null);
    } else {
      return this.setActive(Fqn.schema(fqn),
                            Fqn.table(fqn));
    }
  },
  setActive: function(schema, table) {
    var _schema = validFqnPart(schema) ? schema : null,
        _table = (validFqnPart(table) && !!_schema) ? table : null;

    _.extend(this, {
      _activeSchema: _schema,
      _activeTable: _table
    });

    return this._emitter.emit('selection:change', _schema, _table);
  },
  schema: function() {
    return this._activeSchema;
  },
  table: function() {
    return this._activeTable;
  },
  hasActive: function() {
    return !!this.schema() && !!this.table();
  }
});

function ExecutionHistory() {
  this._colls = [];
  this._emitter = new EventEmitter();
}

_.extend(ExecutionHistory.prototype, {
  on: function() {
    return this._emitter.on.apply(this._emitter, slice.call(arguments, 0));
  },
  _add: function(job) {
    if (!job) {
      return;
    }

    var idx = this._colls.push(job) - 1;
    return idx;
  },
  add: function(job) {
    var idx = this._add(job);

    if (!_.isNumber(idx)) {
      return;
    }

    this._emitter.emit('update', [idx]);
  },
  update: function(job) {
    if (!job) {
      return;
    }
    var oldJobs = _.where(this._colls, {uuid: job.uuid}),
        oldJob = !!oldJobs.length ? oldJobs[0] : [],
        oldJobIdx = this._colls.indexOf(oldJob),
        jobIdx = (oldJobIdx == -1) ? 0 : oldJobIdx;

    if (oldJobIdx == -1) {
      this._colls.unshift(job);
      this._emitter.emit('replace');
    } else {
      this._colls.splice(jobIdx, 1, job);
    }

    this._emitter.emit('update', [jobIdx]);
    return jobIdx;
  },
  addAll: function(jobs) {
    var indices = _.chain(jobs).map(this._add, this).filter().value();
    this._emitter.emit('update', indices);
  },
  replace: function(jobs) {
    this._colls = [];
    _.each(jobs, this._add, this);

    this._emitter.emit('replace');
  },
  getItem: function(i) {
    return this._colls[i];
  },
  getLength: function() {
    return this._colls.length;
  },
  removeAll: function() {
    this._colls = [];
  }
});

module.exports = {
  TableSelection: TableSelection,
  ExecutionHistory: ExecutionHistory
};

