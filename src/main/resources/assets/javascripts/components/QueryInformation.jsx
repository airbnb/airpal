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
      <div className="row spaced query-information">
        <div className="col-sm-12">
          <div className='panel-body'>
            <TabbedArea activeKey={selectedTab} animation={false} onSelect={this._onTabSelect}>
              {/* Lazy-init the child components so they can lazy-fetch their data. */}
              <TabPane eventKey={1} tab="My recent queries" className="query-information-table-tab">
                {selectedTab === 1 ? <MyOwnRuns /> : null}
              </TabPane>
              <TabPane eventKey={2} tab="My saved queries">
                {selectedTab === 2 ? <MySavedQueries /> : null}
              </TabPane>
              <TabPane eventKey={3} tab="All queries" className="query-information-table-tab">
                {selectedTab === 3 ? <AllRunningQueries /> : null}
              </TabPane>
            </TabbedArea>
          </div>
        </div>
      </div>
    );
  },

  _onTabSelect(selectedTab) {
    this.setState({
      selectedTab
    });
  }
});

export default QueryInformation;
