/** @jsx React.DOM */
var React, IndexPage;

// Require all react files
React       = require('react'),
IndexPage   = require('./pages/index');

// Assign React to the window
window.React = React;

$(function() {

  // Render the main react component
  React.renderComponent(
    <IndexPage />,
    document.getElementById('react-container')
  );
});

// Initialize the tooltips
$('[data-toggle="tooltip"]').tooltip({
  container: 'body'
});
