/** @jsx React.DOM */
var React   = require('react');

/* Components */
var RunsTable = require('./RunsTable.react');

/* Stores */
var UserStore = require('../stores/UserStore');

function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser(),
  };
}

var MyOwnRuns = React.createClass({
  displayName: 'MyOwnRuns',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    UserStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount() {
    UserStore.removeStoreListener('change', this._onChange);
  },

  render() {
    var user = this.state.user;
    if (user.name === 'unknown') {
      // Still loading user...
      return <span className="glyphicon glyphicon-repeat indicator-spinner"></span>;
    } else {
      return <RunsTable user={user.name} />;
    }
  },

  _onChange() {
    this.setState(getStateFromStore());
  },
});

module.exports = MyOwnRuns;
