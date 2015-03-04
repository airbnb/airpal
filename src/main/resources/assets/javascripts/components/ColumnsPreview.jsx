import React from 'react';
import Column from './Column';
import _ from 'lodash';
import TableStore from '../stores/TableStore';

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

let ColumnsPreview = React.createClass({
  displayName: 'Columns',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    TableStore.listen(this._onChange);
  },

  componentWillUnmount() {
    TableStore.unlisten(this._onChange);
  },

  render() {
    if( this.state.table && this.state.table.columns ) {
      return this._renderColumns(this.state.table.columns);
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderColumns(collection) {
    let columns;

    let partitions = _.chain(collection).where({
          partition: true
        }).sortBy('name').value(),
        normalCols = _.chain(collection).where({
          partition: false
        }).sortBy('name').value();

    columns = _.chain(partitions.concat(normalCols)).reduce(function(m, col) {
      let reuseGroup = (m.length > 0) && (m[m.length - 1].length < 1), group = reuseGroup ? m[m.length - 1] : [], val;

      group.push(
        <Column
          key={col.name}
          name={col.name}
          type={col.type}
          partition={col.partition} />
      );

      if (!reuseGroup) {
        m.push(group);
      }

      return m;
    }, []).map(function(col, i) {
      return (
        <div key={'col-row-'+i}>
          {col}
        </div>
      );
    }).value();

    // Render the template
    return (
      <div className="flex flex-column columns-container panel-body">
        <div className='columns-label'>
          Columns
        </div>
        <div className='scroll-container'>
          {columns}
        </div>
      </div>
    );
  },

  _renderEmptyMessage() {
    return (
      <div className="flex justify-center text-light panel-body text-center">
        <p>Please select a table.</p>
      </div>
    )
  },

  _capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  }
});

export default ColumnsPreview;
