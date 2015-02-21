/**
 * App Bootstrap
 */

// Assign to global for compatibility with FixedDataTable.
Object.assign = require('object-assign');

var AirpalApp = require('./components/AirpalApp');
import React from 'react';

// Export for http://fb.me/react-devtools
window.React = React;

// Start the main app
React.render(
  <AirpalApp />,
  document.querySelector('.js-react-app')
);
