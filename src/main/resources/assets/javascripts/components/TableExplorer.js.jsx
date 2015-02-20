var React = require('react');

var TableInfo = require('./TableInfo');
var TableSearch = require('./TableSearch');

var TableExplorer = React.createClass({
  displayName: 'TableExplorer',

  render() {
    return (
      <div className="panel panel-default panel-container">
        <div className='panel-heading'>
          <h3 className='panel-title'>
            Table explorer
          </h3>
        </div>
        <TableSearch />
        <TableInfo />
      </div>
    );
  }
});

module.exports = TableExplorer;
