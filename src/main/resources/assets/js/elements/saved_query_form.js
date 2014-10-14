/** @jsx React.DOM */
var React = require('react/addons'),
    _ = require('lodash'),
    SavedQueryForm;

SavedQueryForm = React.createClass({

  getDefaultProps: function() {
    return {
      query: '',
      queryName: '',
      queryDescription: '',
      onSubmit: function(name, description, query) {},
    };
  },

  render: function() {
    return (
      <form action="#" onSubmit={this.handleSubmit} role="form">

        <div className="form-group">
          <pre>{this.props.query}</pre>
        </div>

        <div className="form-group">
          <label htmlFor="query-name">Query Name</label>
          <input ref="name" className="form-control" id="query-name" name="query-name" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="query-description">Query Description</label>
          <textarea ref="description" className="form-control" rows="4" id="query-description" name="query-description">
            {this.props.queryDescription}
          </textarea>
        </div>

      </form>
    );
  },

  /* Event Handlers --------------------------------------------------------- */
  handleSubmit: function($event) {
    $event.preventDefault();
    this.props.onSubmit(this.refs.name.value, this.refs.description.value, this.props.query);
  },
});

module.exports = SavedQueryForm;
