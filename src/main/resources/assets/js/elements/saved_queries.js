/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    cx = React.addons.classSet,
    Highlight = require('highlight.js'),
    SavedQueries,
    SavedQuery;

SavedQuery = React.createClass({
  getDefaultProps: function() {
    return {
      query: {},
      onQueryRun: function() {},
      onQuerySelected: function(query) {},
      onQueryDeleted: function(uuid) {},
    };
  },
  render: function() {
    var highlighted = Highlight.highlight(
          'sql',
          this.props.query.queryWithPlaceholders.query).value;

    return (<div className="panel saved-query row-space-2">
      <div className="panel-header panel-header-small">
        {this.props.query.name}
      </div>
      <div className="panel-body">
        <p>{this.props.query.description}</p>
        <pre
          className="hljs sql"
          onClick={this.handleQuerySelected}>
          <code
            className="hljs sql"
            dangerouslySetInnerHTML={{
              __html: highlighted,
            }} />
        </pre>
      </div>
      <div className="panel-footer">
        <button className="btn btn-small delete" onClick={this.handleDelete}>Delete</button>
        <button className="btn btn-small btn-primary run" onClick={this.handleRun}>Run</button>
      </div>
    </div>);
  },
  handleQuerySelected: function(e) {
    e.preventDefault();
    this.props.onQuerySelected(this.props.query.queryWithPlaceholders.query);
  },
  handleDelete: function(e) {
    e.preventDefault();
    var uuid = this.props.query.uuid;

    $.ajax({
      url: '/api/query/saved/' + uuid,
      type: 'DELETE',
      error: function() {
        console.log('fail to delete');
      },
      success: function(data) {
        this.props.onQueryDeleted(uuid);
      }.bind(this),
    });
  },
  handleRun: function(e) {
    e.preventDefault();

    this.props.onQueryRun(this.props.query);
  },
});

SavedQueries = React.createClass({
  getDefaultProps: function() {
    return {
      queries: [],
      onQueryRun: function() {},
      onQuerySelected: function(query) {},
      onQueryDeleted: function(uuid) {},
    };
  },
  render: function() {
    var queries = _.map(this.props.queries, function(query) {
      return (<SavedQuery
                query={query}
                onQuerySelected={this.props.onQuerySelected}
                onQueryRun={this.props.onQueryRun}
                onQueryDeleted={this.props.onQueryDeleted} />);
    }.bind(this));

    return (<div>{queries}</div>);
  }
});

module.exports = SavedQueries;
