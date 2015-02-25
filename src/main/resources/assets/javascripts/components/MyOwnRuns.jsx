import React from 'react';
import RunsTable from './RunsTable';
import UserStore from '../stores/UserStore';

let cx = React.addons.classSet;

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
    this.onChange();
  },

  componentWillUnmount() {
    UserStore.unlisten(this.onChange);
  },

  render() {
    let user = this.state.user;

    if (user.name === 'unknown') {
      // Still loading user...
      let loading = cx({
        'glyphicon': true,
        'glyphicon-repeat': true,
        'indicator-spinner': true
      });

      return (
        <span className={loading} />
      );
    }

    return (
      <RunsTable
        user={user.name}
        tableWidth={this.props.tableWidth}
        tableHeight={this.props.tableHeight} />
    );
  },

  onChange() {
    this.setState(getStateFromStore());
  }
});

export default MyOwnRuns;
