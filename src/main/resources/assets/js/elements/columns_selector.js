/** @jsx React.DOM */

var React = require('react'),
    Fqn = require('../fqn'),
    _ = require('lodash'),
    GridOpts = require('../util').GridOpts,
    ColumnsSelector,
    DefaultColumns;

DefaultColumns = columns = [
  {
    name: 'Name',
    field: 'name',
    id: 1,
    width: 316
  },
  {
    name: 'Type',
    field: 'type',
    id: 2,
    width: 316
  },
  {
    name: 'Is Partition Key',
    field: 'partition',
    id: 3,
    width: 316
  }
];

ColumnsSelector = React.createClass({
  getInitialState: function() {
    return {
      activeTable: null,
      columns: null,
    };
  },
  render: function() {
    if (!this.state.columns) {
      return (<div>
        No table selected.
      </div>);
    }

    var partitions = _.chain(this.state.columns).where({partition: true}).sortBy('name').value(),
        normalCols = _.chain(this.state.columns).where({partition: false}).sortBy('name').value();

    var cols = _.chain(partitions.concat(normalCols)).reduce(function(m, col) {
      var reuseGroup = (m.length > 0) && (m[m.length - 1].length < 5),
          group = reuseGroup ? m[m.length - 1] : [],
          val;

      group.push(<div className="col-3 col-info" key={'col-' + col.name}>
        <span className="name">{col.name}</span>
        <span className="data-type"> ({col.type})</span>
        <span className="partition">{col.partition ? ' (Partition)' : ''}</span>
      </div>);

      if (group.length < 5) {
        group.push(<div className="col-1"></div>);
      }

      if (!reuseGroup) {
        m.push(group);
      }

      return m;
    }, []).map(function(col, i) {
      return (<div className="row row-space-2" key={'col-row-' + i}>{col}</div>);
    }).value();

    return (<div className="panel-body row" ref="grid" id="table-columns">
      {cols}
    </div>);
  },
  componentWillUpdate: function(nextProps, nextState) {
    var activeTable = nextState.activeTable,
        schema,
        table;

    console.log('component will update', activeTable, !activeTable);
    if (!activeTable || (this.state.activeTable === activeTable)) {
      if (!activeTable && this.grid) {
        this.grid.destroy();
        this.grid = null;
        delete this.grid;
      }
      return;
    }

    schema = Fqn.schema(activeTable);
    table = Fqn.table(activeTable);

    $.ajax({
      url: '/api/table/' + schema + '/' + table + '/columns',
      type: 'GET',
      error: function() {
        this.setState({
          columns: null
        });
      }.bind(this),
      success: function(res) {
        var data = _.sortBy(res, 'name');

        this.setState({
          columns: data
        });
      }.bind(this)
    });
  },
  componentDidUpdate: function(prevProps, prevState, rootNode) {
    var opts = GridOpts({}),
        grid;

    if (!this.refs || !this.refs.grid || !this.state.columns) {
      //console.log('componentDidUpdate :: this', this);
      return;
    }

    //this.grid = new Slick.Grid(this.refs.grid.getDOMNode(), this.state.columns, DefaultColumns, opts);
    //console.log('slick grid', this.grid, 'with data', this.state.columns);

    //this.grid.setSelectionModel(new Slick.RowSelectionModel({
      //selectActiveRow: false
    //}));
  }
});

module.exports = ColumnsSelector;

