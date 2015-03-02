import React from 'react';
import RunsTable from './RunsTable';
import UserStore from '../stores/UserStore';

function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

let MyOwnRuns = React.createClass({
  displayName: 'MyOwnRuns',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    UserStore.listen(this.onChange);
  },

  componentWillUnmount() {
    UserStore.unlisten(this.onChange);
  },

  render() {
    let user = this.state.user;
    if (user.name === 'unknown') {
      // Still loading user...
      return <span className="glyphicon glyphicon-repeat indicator-spinner"></span>;
    } else {
      return (
        <RunsTable
          user={user.name}
          tableWidth={this.props.tableWidth}
          tableHeight={this.props.tableHeight} />
      );
    }
  },

  onChange() {
    this.setState(getStateFromStore());
  }
});

export default MyOwnRuns;
