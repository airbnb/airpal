/** @jsx React.DOM */
var React = require('react');

/* ApiUtils */
var QueryApiUtils = require('../utils/QueryApiUtils');

/* Stores */
var QueryStore = require('../stores/QueryStore');

/* Actions */
var QueryActions = require('../actions/QueryActions');

function getStateFromStore() {
  return {
    queries: QueryStore.all({sort: true}),
  };
}

var MySavedQueries = React.createClass({
  displayName: 'MySavedQueries',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    QueryStore.addStoreListener('change', this._onChange);

    this._fetchQueries();
  },

  componentWillUnmount() {
    QueryStore.removeStoreListener('change', this._onChange);
  },

  render() {
    return (
      <table className="table">
        <tbody>
          {this.renderChildren()}
        </tbody>
      </table>
    );
  },

  renderChildren() {
    if (this.state.queries.length === 0) {
      return this.renderEmptyMessage();
    } else {
      return this.state.queries.map((query) => {
        var queryText = query.queryWithPlaceholders.query;
        return (
          <tr key={query.uuid} className="saved-query">
            <td>
              <div className="row">
                <div className="col-md-3">
                  <h4>{query.name}</h4>
                  <p>{query.description}</p>
                </div>
                <div className="col-md-9">
                  <pre onClick={this._onSelectQuery.bind(null, queryText)}>
                  {queryText}
                  </pre>
                </div>
              </div>
            </td>
          </tr>
        );
      });
    }
  },

  renderEmptyMessage() {
    return (
      <tr key="1" className="info">
        <td className="text-center" colSpan="5">No saved queries</td>
      </tr>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  },

  _fetchQueries() {
    QueryApiUtils.fetchSavedQueries();
  },

  _onSelectQuery(query) {
    QueryActions.selectQuery(query);
  },
});

module.exports = MySavedQueries;
