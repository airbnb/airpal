/** @jsx React.DOM */
var React = require('react');

/* Components */
var SearchInputField = require('./SearchInputField.react');

/* Header component */
var TableSearch = React.createClass({
  displayName: 'TableSearch',
  render: function () {
    return (
      <section className="row table-search-row">
        <div className="col-sm-12">
          <div className="row">

            <form className="col-sm-7" role="form">
              <div className="form-group">
                <label htmlFor="tables-input">Tables:</label>
                <SearchInputField />
              </div>
            </form>

            <form className="col-sm-5" role="form">
              <div className="form-group">
                <label htmlFor="tables-input">Partition:</label>
                <SearchInputField />
              </div>
            </form>

          </div>
        </div>
      </section>
    );
  }
});

module.exports = TableSearch;