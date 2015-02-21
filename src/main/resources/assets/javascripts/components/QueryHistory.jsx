var React = require('react');

var QueryInformation = require('./QueryInformation.jsx');

var QueryHistory = React.createClass({
  render() {
    return (
      <div className='panel panel-default panel-container'>
        <div className='panel-heading'>
          <h3 className='panel-title'>
            Query history
          </h3>
        </div>
        <QueryInformation />
      </div>
    );
  }
});

module.exports = QueryHistory;
