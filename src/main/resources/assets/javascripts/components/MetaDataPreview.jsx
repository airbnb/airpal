import React from 'react';
import _ from 'lodash';
import TableStore from '../stores/TableStore';

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

let MetaDataPreview = React.createClass({
  displayName: 'MetaDataPreview',

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
    if( !_.isEmpty(this.state.table) ) {
      return this._renderMetaData();
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderEmptyMessage() {
    return (
      <div className="alert alert-warning">
        <p>There is no table selected. Please select a table to view the meta data.</p>
      </div>
    )
  },

  _renderMetaData() {
    return (
      <div className="col-sm-12 column-selector">
        <p><strong>Table name: </strong> {this.state.table.name}</p>
      </div>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  }
});

export default MetaDataPreview;
