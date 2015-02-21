/**
 * App Bootstrap
 */

// Assign to global for compatibility with FixedDataTable.
Object.assign = require('object-assign');

var AirpalApp = require('./components/AirpalApp');
import React from 'react';

// Start the main app
React.render(
  <AirpalApp />,
  document.querySelector('.js-react-app')
);
