var _ = require('lodash'),
    Selectize = require('./selectize');

function selectize($el, opts) {
  opts || (opts = {});

  return $el.selectize(_.extend({
    plugins: ['remove_button'],
    create: false,
    openOnFocus: true,
    hideSelected: true,
    preload: 'focus',
    loadThrottle: 1000,
  }, opts));
}

function GridOpts(opts) {
  opts || (opts = {});
  return _.extend({}, {
    editable: false,
    enableColumnReorder: false,
    fullWidthRows: true,
    showHeaderRow: false,
    headerRowHeight: 2,
    topPanelHeight: 30,
    enableTextSelectionOnCells: true,
    syncColumnCellResize: true
  }, opts);
}

module.exports = {
  selectize: selectize,
  GridOpts: GridOpts
};
