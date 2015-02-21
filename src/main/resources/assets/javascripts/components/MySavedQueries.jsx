/** @jsx React.DOM */
var React = require('react');

/* ApiUtils */
var QueryApiUtils = require('../utils/QueryApiUtils');

/* Stores */
var QueryStore = require('../stores/QueryStore');

/* Actions */
var QueryActions = require('../actions/QueryActions');
var RunActions = require('../actions/RunActions');

/* Components */
var { Button, ButtonToolbar } = require('react-bootstrap');

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
      <div className='panel-body'>
        {this.renderChildren()}
      </div>
    );
  },

  renderChildren() {
    if (this.state.queries.length === 0) {
      return this.renderEmptyMessage();
    } else {
      return this.state.queries.map((query) => {
        var queryText = query.queryWithPlaceholders.query;
        return (
          <div className='row'>
            <div className="col-md-12">
              <h4>{query.name}</h4>
              <p>{query.description}</p>
            </div>
            <div className="col-md-12">
              <pre onClick={this._onSelectQuery.bind(null, queryText)}>
                {truncate(queryText, 750)}
              </pre>
              <ButtonToolbar className="pull-right">
                <Button bsSize="xsmall" onClick={this._deleteQuery.bind(null, query.uuid)}>
                  Delete
                </Button>
                <Button bsSize="xsmall" bsStyle="primary" onClick={this._runQuery.bind(null, queryText)}>
                  Run
                </Button>
              </ButtonToolbar>
            </div>
          </div>
        );
      });
    }
  },

  renderEmptyMessage() {
    return (
      <tr className="info">
        <td className="text-center" colSpan="1">No saved queries</td>
      </tr>
    );
  },

  _onChange() {
    this.setState(getStateFromStore());
  },

  _fetchQueries() {
    QueryApiUtils.fetchSavedQueries();
  },

  _onSelectQuery(query) {
    QueryActions.selectQuery(query);
  },

  _runQuery(queryText) {
    QueryActions.selectQuery(queryText);
    RunActions.execute({query: queryText});
  },

  _deleteQuery(uuid) {
    QueryActions.destroyQuery(uuid);
  },
});

function truncate(text, length) {
  var output = text || '';
  if (output.length > length) {
    output = output.slice(0, length) + '...';
  }
  return output;
}

module.exports = MySavedQueries;
