/**
 * App Bootstrap
 */

// Assign to global for compatibility with FixedDataTable.
Object.assign = require('object-assign');

var AirpalApp = require('./components/AirpalApp');
var React = require('react');

// Export for http://fb.me/react-devtools
window.React = React;

// Start the main app
React.render(
  <AirpalApp />,
  document.querySelector('.js-react-app')
);
