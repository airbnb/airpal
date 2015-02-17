/** @jsx React.DOM */
var React = require('react');

/* Utilities */
var moment = require('moment');
var path = require('path');

var MyOwnRunsRow = React.createClass({
  displayName: 'MyOwnQueriesRow',

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({ model: nextProps.model });
  },

  getInitialState: function() {
    return { model: this.props.model };
  },

  render: function () {
    var model = this.state.model;
    return (
      <tr>
        <td>{model.query}</td>
        <td>{this.queryState()}</td>
        <td title={this.queryStartTimeFull()}>{this.queryStartTime()}</td>
        <td>{model.queryStats.elapsedTime}</td>
        <td>{this.queryDownloadLink()}</td>
      </tr>
    );
  },

  // - Presenter helpers
  queryState: function() {
    if ( !!this.state.model.state ) {
      if ( this.state.model.state === 'FAILED' ) {
        return (
          <div className="text-danger">
            <span className="glyphicon glyphicon-info-sign"></span> {this.state.model.error.message}
          </div>
        );
      } else if ( this.state.model.state === 'FINISHED' ) {
        return (<span className="label label-success">{this.state.model.state}</span>);
      } else {
        return (<span className="label label-info">{this.state.model.state}</span>);
      }
    }
  },

  queryStartTime: function () {
    if (!!this.state.model.queryStarted) {
      return moment.utc(this.state.model.queryStarted, 'x').format('lll');
    }
  },

  queryStartTimeFull: function () {
    if (!!this.state.model.queryStarted) {
      return moment.utc(this.state.model.queryStarted, 'x').format();
    }
  },

  queryDownloadLink: function() {
    var output = this.state.model.output;
    if (output && output.location) {
      return (
        <a href={output.location} title="Download a CSV">
          {path.basename(output.location)}
        </a>
      );
    }
  }
});

module.exports = MyOwnRunsRow;
