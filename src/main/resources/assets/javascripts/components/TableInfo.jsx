import React from 'react';
import ColumnsPreview from './ColumnsPreview';
import DataPreview from './DataPreview';
import MetaDataPreview from './MetaDataPreview';
import { TabbedArea, TabPane } from 'react-bootstrap';

let TableInfo = React.createClass({
  displayName: 'TableInfo',

  getInitialState() {
    return {
      selectedTab: 1
    };
  },

  render() {
    let {selectedTab} = this.state;
    return (
      <div className="flex tables-selector-row">
        <ColumnsPreview />
      </div>
    );
  },

  _onTabSelect(selectedTab) {
    this.setState({
      selectedTab
    });
  }
});

export default TableInfo;
