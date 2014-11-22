var _ = require('lodash'),
    Fqn = require('./fqn'),
    EventEmitter = require('events').EventEmitter,
    GridOpts = require('./util').GridOpts;

function PreviewComponent($el) {
  this._emitter = new EventEmitter();
  this.$el = $el;
}

_.extend(PreviewComponent.prototype, {
  render: function(schema, table) {
    var columnsInfo, preview;

    columnsInfo = $.ajax({
      url: '/api/table/' + schema + '/' + table + '/columns',
      type: 'GET'
    });

    preview = $.ajax({
      url: '/api/table/' + schema + '/' + table + '/preview',
      type: 'GET'
    });

    $.when(columnsInfo, preview).done(_.bind(function(colData, previewData) {
      this._createGrid(colData[0], previewData[0]);
    }, this));
  },
  _createGrid: function(columns, data) {
    var grid, cols, dataObjs;

    dataObjs = _.map(data, function(row) {
      return _.reduce(row, function(memo, value, i) {
        memo[columns[i].name] = value;
        return memo;
      }, {});
    });

    cols = _.map(columns, function(col, i) {
      return {
        name: col.name,
        field: i,
        id: i,
        minWidth: 25,
        maxWidth: 120
      };
    });

    //console.log('Created cols', cols, 'data', data, 'dataObjs', dataObjs);
    grid = new Slick.Grid('#' + this.$el.attr('id'),
                          data,
                          cols,
                          GridOpts({fullWidthRows: false}));
  }
});

module.exports = {
  PreviewComponent: PreviewComponent
}
