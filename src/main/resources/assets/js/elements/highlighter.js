/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    cx = React.addons.classSet,
    Highlight = require('highlight.js'),
    Highlighter;

Highlighter = React.createClass({
  getDefaultProps: function() {
    return {
      query: ''
    };
  },
  render: function() {
    var highlighted = Highlight.highlight(
          'sql',
          this.props.query).value;

    return (
      <pre className="hljs sql">
          <code
            className="hljs sql"
            dangerouslySetInnerHTML={{
              __html: highlighted,
            }} />
      </pre>
    );
  },
});

module.exports = Highlighter;
