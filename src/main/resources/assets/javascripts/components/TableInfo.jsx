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
      <section className="row tables-selector-row">
        <div className="col-sm-12">
          <div className="panel-body">
            <TabbedArea
              activeKey={selectedTab}
              animation={false}
              onSelect={this._onTabSelect}>
                {/* Lazy-init the child components so they can lazy-fetch their data. */}
                <TabPane eventKey={1} tab="Columns">
                  {selectedTab === 1 ? <ColumnsPreview /> : null}
                </TabPane>

                <TabPane eventKey={2} tab="Data Preview">
                  {selectedTab === 2 ? <DataPreview /> : null}
                </TabPane>
            </TabbedArea>
          </div>
        </div>
      </section>
    );
  },

  _onTabSelect(selectedTab) {
    this.setState({
      selectedTab
    });
  }
});

export default TableInfo;
