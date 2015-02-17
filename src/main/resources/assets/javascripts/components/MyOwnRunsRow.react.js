/** @jsx React.DOM */
var React = require('react');

/* Utilities */
var moment = require('moment');

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
    return (
      <tr>
        <td>{this.state.model.query}</td>
        <td>{this.queryState()}</td>
        <td>{this.queryStartTime()}</td>
        <td>{this.queryEndTime()}</td>
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
    if ( !!this.state.model.queryStarted ) {
      return moment.utc(this.state.model.queryStarted, 'x').format('MM-DD-YYYY');
    }
  },

  queryEndTime: function() {
    if ( !!this.state.model.queryFinished ) {
      return moment.utc(this.state.model.queryFinished, 'x').calendar();
    }
  },

  queryDownloadLink: function() {
    if ( !!this.state.model.output && !!this.state.model.output.location ) {
      return (
        <a href={this.state.model.output.location} title="Grab the file">
          Download
        </a>
      );
    }
  }
});

module.exports = MyOwnRunsRow;