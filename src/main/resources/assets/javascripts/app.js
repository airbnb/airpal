/**
 * App Bootstrap
 */

import assign from 'object-assign';

// Assign to global for compatibility with FixedDataTable.
Object.assign = Object.assign || assign;

import AirpalApp from './components/AirpalApp.jsx';
import React from 'react';

// Start the main app
React.render(
  <AirpalApp />,
  document.querySelector('.js-react-app')
);
