import React from 'react';
import RunActions from '../actions/RunActions';
import { TabbedArea, TabPane } from 'react-bootstrap';
import MyOwnRuns from './MyOwnRuns';
import MySavedQueries from './MySavedQueries';
import AllRunningQueries from './AllRunningQueries';

let QueryInformation = React.createClass({
  displayName: 'QueryInformation',

  getInitialState() {
    return {
      selectedTab: 1
    };
  },

  componentDidMount() {
    RunActions.connect();
  },

  componentWillUnmount() {
    RunActions.disconnect();
  },

  render() {
    let {selectedTab} = this.state;
    return (
      <div className='flex flex-column tab-container'>
        <TabbedArea className='flex flex-initial'
          activeKey={selectedTab}
          animation={false}
          onSelect={this.onTabSelect}
          bsStyle='pills'>
            <TabPane className="flex query-information-table-tab"
              eventKey={1}
              tab="My Recent">
                {selectedTab === 1 && <MyOwnRuns />}
            </TabPane>
            <TabPane className='flex query-information-table-tab'
              eventKey={2}
              tab="My Saved">
                {selectedTab === 2 && <MySavedQueries />}
            </TabPane>
            <TabPane className="flex query-information-table-tab"
              eventKey={3}
              tab="All">
                {selectedTab === 3 && <AllRunningQueries />}
            </TabPane>
        </TabbedArea>
      </div>
    );
  },

  onTabSelect(selectedTab) {
    this.setState({ selectedTab });
  }
});

export default QueryInformation;
