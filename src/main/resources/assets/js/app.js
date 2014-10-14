/** @jsx React.DOM */
var React, IndexPage, hasInit,
    InitReact;

// Require some libs to start with
require('./lib/jquery.cookie');
require('./lib/jquery.event.drag-2.2');
require('./lib/slick.core');
require('./lib/slick.grid');

// Require all react files
React       = require('react'),
IndexPage   = require('./pages/index'),
hasInit     = false;

function initialize() {
  if (!hasInit) {

    // Render the main react component
    React.renderComponent(
      <IndexPage />,
      document.getElementById('react-container')
    );

    // Set init to true
    hasInit = true;
  }
}

// Assign React to the window
window.React = React;
$(initialize());

// Initialize the tooltips
$('[data-toggle="tooltip"]').tooltip({
  container: 'body'
});

/**
 * Someday:

var React = require('react'),
    IndexPage = require('./pages/index'),
    Cortex = require('cortexjs'),
    hasInit = false;

function InitReact() {
  if (!hasInit) {
    var indexPage,
        activeTable,
        history,
        savedQueries;

    activeTable = new Cortex({
      schema: null,
      table: null,
      partition: null,
    }, function(updatedCortex) {
      indexPage.setProps({activeTable: updatedCortex});
    });

    history =

    indexPage = React.renderComponent(
      <IndexPage
        activeTable={activeTable}
        history={history}
        savedQueries={savedQueries} />,
      document.getElementById('react-container'));

    hasInit = true;
  }
}

window.React = React;
module.exports = InitReact;

*/
