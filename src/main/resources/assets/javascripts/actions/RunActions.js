/*
 * RunActions
 */

var AppDispatcher = require('../dispatchers/AppDispatcher');
var RunConstants  = require('../constants/RunConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  wentOnline: function() {
    AppDispatcher.handleViewAction({
      type: RunConstants.USER_WENT_ONLINE
    });
  },

  wentOffline: function() {
    AppDispatcher.handleViewAction({
      type: RunConstants.USER_WENT_OFFLINE
    });
  },

  connect: function() {
    AppDispatcher.handleViewAction({
      type: RunConstants.CONNECT
    });
  },

  disconnect: function() {
    AppDispatcher.handleViewAction({
      type: RunConstants.DISCONNECT
    });
  },

  execute: function(obj) {
    AppDispatcher.handleViewAction({
      type: RunConstants.EXECUTE_RUN,
      query: obj.query,
      tmpTable: obj.tmpTable
    });
  },

  // - ServerActions ------------------------------------------------------- //
  onOpen: function() {
    AppDispatcher.handleServerAction({
      type: RunConstants.ON_SSE_OPEN
    });
  },

  onError: function(event) {
    AppDispatcher.handleServerAction({
      type: RunConstants.ON_SSE_ERROR,
      event: event
    });
  },

  onMessage: function(data) {
    AppDispatcher.handleServerAction({
      type: RunConstants.ON_SSE_MESSAGE,
      data: data.job
    });
  },

  addRun: function(data) {
    AppDispatcher.handleServerAction({
      type: RunConstants.ADD_RUN,
      data: data
    });
  },

  addMultipleRuns: function(runs) {
    AppDispatcher.handleServerAction({
      type: RunConstants.ADD_MULTIPLE_RUNS,
      data: runs
    });
  },
};
