import React from 'react';
import QueryStore from '../stores/QueryStore';
import QueryActions from '../actions/QueryActions';
import RunActions from '../actions/RunActions';
import { Button, ButtonToolbar } from 'react-bootstrap';

function getStateFromStore() {
  return {
    queries: QueryStore.getCollection().all({
      sort: true
    })
  };
}

let MySavedQueries = React.createClass({
  displayName: 'MySavedQueries',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    QueryStore.listen(this._onChange);
    this._fetchQueries();
  },

  componentWillUnmount() {
    QueryStore.unlisten(this._onChange);
  },

  render() {
    return (
      <div className='panel-body'>
        <div className='scroll-container'>
          {this.renderChildren()}
        </div>
      </div>
    );
  },

  renderChildren() {
    if (this.state.queries.length === 0) {
      return this.renderEmptyMessage();
    } else {
      return this.state.queries.map((query) => {
        let queryText = query.queryWithPlaceholders.query;
        return (
          <div className='saved-container'>
            <div>
              <h4>{query.name}</h4>
              <p>{query.description}</p>
            </div>
            <div className='clearfix'>
              <pre onClick={this._onSelectQuery.bind(null, queryText)}>
                <code>{truncate(queryText, 750)}</code>
              </pre>
              <ButtonToolbar className="pull-right">
                <Button
                  bsSize="xsmall"
                  onClick={this._deleteQuery.bind(null, query.uuid)}>
                    Delete
                </Button>
                <Button
                  bsSize="xsmall"
                  bsStyle="success"
                  onClick={this._runQuery.bind(null, queryText)}>
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
      <div className='row'>
        <div className="col-md-12 text-center">
          No saved queries
        </div>
      </div>
    );
  },

  _onChange() {
    this.setState(getStateFromStore());
  },

  _fetchQueries() {
    QueryActions.fetchSavedQueries();
  },

  _onSelectQuery(query) {
    QueryActions.selectQuery(query);
  },

  _runQuery(queryText) {
    QueryActions.selectQuery(queryText);
    RunActions.execute({
      query: queryText
    });
  },

  _deleteQuery(uuid) {
    QueryActions.destroyQuery(uuid);
  }
});

function truncate(text, length) {
  let output = text || '';
  if (output.length > length) {
    output = output.slice(0, length) + '...';
  }
  return output;
}

export default MySavedQueries;
