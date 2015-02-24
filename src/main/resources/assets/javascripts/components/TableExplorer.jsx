var React = require('react');

var TableInfo = require('./TableInfo');
var TableSearch = require('./TableSearch');

var TableExplorer = React.createClass({
  displayName: 'TableExplorer',

  render() {
    return (
      <div className='container'>
        <TableSearch />
        <TableInfo />
      </div>
    );
  }
});

module.exports = TableExplorer;
