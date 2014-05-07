/** @jsx React.DOM */

var React = require('react'),
    IndexPage = require('./pages/index'),
    hasInit = false;

function InitReact() {
  if (!hasInit) {
    React.renderComponent(
      <IndexPage />,
      document.getElementById('react-container'));
    hasInit = true;
  }
}

window.React = React;

module.exports = InitReact;

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
**/
