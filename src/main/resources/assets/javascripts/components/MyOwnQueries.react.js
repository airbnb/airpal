/** @jsx React.DOM */
var React   = require('react'),
    _       = require('lodash'),
    moment  = require('moment');

/* Actions */
var QueryActions = require('../actions/QueryActions');

/* Stores */
var QueryStore  = require('../stores/QueryStore'),
    UserStore   = require('../stores/UserStore');

// State actions
function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser(),
    queries: QueryStore.getCurrentUserQueries()
  };
}

var MyOwnQueries = React.createClass({
  displayName: 'MyOwnQueries',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentDidMount: function() {
    UserStore.addStoreListener('change', this._onChange);
    QueryStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount: function() {
    UserStore.removeStoreListener('change');
    QueryStore.removeStoreListener('change');
  },

  render: function () {
    console.log(this.state.queries);
    return (
      <div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Query</th>
              <th>Started</th>
              <th>Ended</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>{this.renderTableRows()}</tbody>
        </table>
      </div>
    );
  },

  renderTableRows: function() {
    if( _.isEmpty(this.state.queries) ) return;

    console.log(this.state.queries);
    return _.map(this.state.queries, function(obj, idx) {
      return(
        <tr key={idx}>
          <td>{obj.query}</td>
          <td>{moment(obj.queryStarted).calendar()}</td>
          <td>{moment(obj.queryFinished).calendar()}</td>
          <td><a href={obj.output.location} title="Download the file">Download file</a></td>
        </tr>
      );
    });
  },

  /* - Store events -------------------------------------------------------- */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = MyOwnQueries;