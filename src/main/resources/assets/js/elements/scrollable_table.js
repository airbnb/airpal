/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    ScrollableTable,
    STh,
    STd;

function DragData(column) {
  this.column = column;
  this.columnStartWidth = column.width;
  this.startPos = null;
  this.deltaX = 0.0;
}

DragData.prototype.setStartX = function(startPos) {
  console.log('setStartX', startPos);
  if (this.startPos === null) {
    console.log('setting startPos', startPos);
    this.startPos = startPos;
  }
}

DragData.prototype.reset = function() {
  this.startPos = null;
  this.deltaX = null;
};

DragData.prototype.moveX = function(pos) {
  console.log('moveX',
              'pos', pos, 'startPos', this.startPos,
              'old deltaX', this.deltaX,
              'new deltaX', (pos - this.startPos),
              'this', _.clone(this));
  this.deltaX = pos - this.startPos;
}

DragData.prototype.getNewWidth = function() {
  return this.columnStartWidth + this.deltaX;
}

function updateColumn(columns, idx, data) {
  var newColumns, newData;
  console.log('old columns', columns, 'old data', columns[idx]);
  newData = _.extend({}, columns[idx], data);
  newColumns = columns.slice(0);
  newColumns.splice(idx, 1, newData);
  console.log('new columns', newColumns, 'new data', newData);
  return newColumns;
}

STh = React.createClass({
  getInitialState: function() {
    return {
      dragData: new DragData(_.extend({}, this.props)),
    };
  },
  getDefaultProps: function() {
    return {
      className: null,
      label: null,
      width: 100,
      onDragStart: function() {},
      onDragEnd: function() {},
      onDrag: function() {},
    };
  },
  render: function() {
    var style = { width: this.props.width };
    return (<th
                style={style}
                className={this.props.className}>
        {this.props.label}
    </th>);
        //<span draggable="true"
              //className="drag-handle"
              //onDragStart={this.handleDrag.bind(this, 'start')}
              //onDragEnd={this.handleDrag.bind(this, 'end')}
              //onDrag={_.throttle(this.handleDrag.bind(this, 'drag'), 100)} />
      //</th>);
  },
  handleDrag: function(type, e) {
    if (type === 'start') {
      this.props.onDragStart(this.state.dragData, e);
    } else if (type === 'end') {
      this.props.onDragEnd(this.state.dragData, e);
    } else if (type === 'drag') {
      this.props.onDrag(this.state.dragData, e);
    }
  },
});
STd = React.createClass({
  getInitialState: function() {
    return {
      render: this.props.column.render,
    };
  },
  getDefaultProps: function() {
    return {
      column: null,
      data: null,
    };
  },
  render: function() {
    if (_.isEmpty(this.props.column)) { return; }
    var style = { width: this.props.column.width },
        content = this.state.render(this.props.data);

    return (<td style={style}
                className={this.props.column.className}>
      <div style={style}>{content}</div>
    </td>);
  },
});

ScrollableTable = React.createClass({
  getInitialState: function() {
    return {
      columns: this.props.columns,
      data: this.props.data,
      uuid: this.props.uuid,
      dataSortBy: this.props.dataSortBy,
    };
  },
  getDefaultProps: function() {
    return {
      columns: [],
      data: [],
      uuid: function(row, rowIndex) {},
      dataSortBy: null,
      noScroll: false,
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      data: nextProps.data,
      columns: nextProps.columns,
    });
  },
  render: function() {
    var headers, rows, rowIdx, tableWidth = 0;

    headers = _.map(this.state.columns, function(col, i) {

      return (<STh
                className={col.className}
                label={col.label}
                width={col.width}
                render={col.render}
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                onDrag={this.handleDrag} />);
    }, this);

    rows = _.chain(this.state.data);

    if (!!this.state.dataSortBy) {
      rows = rows.sortBy(this.state.dataSortBy);
    }

    rowIdx = 0;
    rows = rows.map(function(row) {
      var columns;
      if (_.isEmpty(row)) { return; };

      columns = _.map(this.state.columns, function(col, i) {
        var ref, style, content;

        if (_.isEmpty(col)) { return; }

        return (<STd
                  column={col}
                  data={row} />);
      }, this);

      return (<tr key={this.props.uuid(row, rowIdx++)}>{columns}</tr>);
    }, this).value();

    var classes = ['scroll-table',
      'history-table',
      'table',
      'table-bordered',
      'table-striped',
      'table-condensed'];

    if (!!this.props.noScroll) { classes.push('no-scroll'); }

    return (<table
      className={classes.join(' ')}
      style={ {width: tableWidth} }>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>);
  },
  handleDragStart: function(dragData, e) {
    var $target = $(e.target),
        $el = $(this.getDOMNode()),
        $th = $el.find('th.' + dragData.column.className),
        $tds = $el.find('td.' + dragData.column.className),
        otherTds = _.reduce(this.state.columns, function(memo, col) {
          if (col.className === dragData.column.className) {
            return memo;
          }

          return memo.concat({
            $th: $el.find('th.' + col.className),
            $tds: $el.find('td.' + col.className),
          });
        }, []);

    dragData.setStartX(e.pageX);
    dragData.meta = {
      col: {
        $th: $th,
        $tds: $tds,
      },
      otherCols: otherTds,
    };
    console.log('handleDragStart', _.clone(e), $target, $target.position(), this);
  },
  handleDragEnd: function(dragData, e) {
    dragData.moveX(e.pageX);
    dragData.column.dragData = null;
    var $target = $(e.target),
        newWidth = dragData.getNewWidth();
    this.setState({
      columns: updateColumn(this.state.columns, dragData.columnIdx, {
        width: newWidth,
        dragData: null,
      })
    });
  },
  handleDrag: function(dragData, e) {
    if (!!e.pageX) {
      dragData.moveX(e.pageX);
    }
    var $target = $(e.target),
        newWidth = dragData.getNewWidth();
    return this.setState({
      columns: updateColumn(this.state.columns, dragData.columnIdx, {
        width: newWidth,
      })
    });

    var $target = $(e.target),
        newWidth = dragData.getNewWidth(),
        $th = dragData.meta.col.$th,
        $tds = dragData.meta.col.$tds,
        others = dragData.meta.otherCols;

    $th.width(newWidth);
    $tds.width($th.width());

      //_.each(others, function(other) {
        //other.$tds.width(other.$th.width());
      //});
  },
});

module.exports = ScrollableTable;
