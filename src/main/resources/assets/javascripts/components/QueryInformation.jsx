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
      selectedTab: 1,
      tableWidth: 400,
      tableHeight: 240
    };
  },

  componentDidMount() {
    RunActions.connect();
    this.update();

    let win = window;

    if (win.addEventListener) {
      win.addEventListener('resize', this.onResize, false);
    } else if (win.attachEvent) {
      win.attachEvent('onresize', this.onResize);
    } else {
      win.onresize = this.onResize;
    }
  },

  componentWillUnmount() {
    RunActions.disconnect();
  },

  onResize() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(this.update, 16);
  },

  update() {
    this.setState({
      tableWidth: this.getDOMNode().offsetWidth,
      tableHeight: this.getDOMNode().offsetHeight,
    });
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
                {selectedTab === 1 &&
                  <MyOwnRuns
                    tableWidth={this.state.tableWidth}
                    tableHeight={this.state.tableHeight} />}
            </TabPane>
            <TabPane className='flex query-information-table-tab'
              eventKey={2}
              tab="My Saved">
                {selectedTab === 2 && <MySavedQueries />}
            </TabPane>
            <TabPane className="flex query-information-table-tab"
              eventKey={3}
              tab="All">
                {selectedTab === 3 &&
                  <AllRunningQueries
                    tableWidth={this.state.tableWidth}
                    tableHeight={this.state.tableHeight} />}
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
