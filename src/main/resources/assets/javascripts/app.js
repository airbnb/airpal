/**
 * App Bootstrap
 */

var AipalApp = require('./components/AirpalApp.react');
var React = require('react');

// Export for http://fb.me/react-devtools
window.React = React;

// Start the main app
React.render(
  <AipalApp />,
  document.querySelector('.js-react-app')
);