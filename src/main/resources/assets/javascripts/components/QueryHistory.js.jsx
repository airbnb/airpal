var React = require('react');

var QueryInformation = require('./QueryInformation');

var QueryHistory = React.createClass({
  render() {
    return (
      <div className='container'>
        <QueryInformation />
      </div>
    );
  }
});

module.exports = QueryHistory;
