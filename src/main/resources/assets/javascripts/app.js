/**
 * App Bootstrap
 */

import 'es6-shim';
import AirpalApp from './components/AirpalApp.jsx';
import React from 'react';

// Start the main app
React.render(
  <AirpalApp />,
  document.querySelector('.js-react-app')
);
