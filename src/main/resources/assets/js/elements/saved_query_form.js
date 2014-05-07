/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    cx = React.addons.classSet,
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
    return (<form action="#" onSubmit={this.handleSubmit}>
      <fieldset>
        <pre className="o2-code" id="query-to-save">
          {this.props.query}
        </pre>
        <div className="row row-condensed row-space-2">
          <label className="col-4 text-right" htmlFor="query-name">
            Query Name
          </label>
          <div className="col-8">
            <input ref="name" name="query-name" type="text" />
          </div>
        </div>
        <div className="row row-condensed">
          <label className="col-4 text-right" htmlFor="query-description">
            Query Description
          </label>
          <div className="col-8">
            <textarea ref="description" rows="4" name="query-description">
              {this.props.queryDescription}
            </textarea>
          </div>
        </div>
      </fieldset>
    </form>);
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onSubmit(this.refs.name.value,
                        this.refs.description.value,
                        this.props.query);
  },
});

module.exports = SavedQueryForm;
