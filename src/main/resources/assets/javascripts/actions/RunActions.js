/*
 * RunActions
 */

var AppDispatcher = require('../dispatchers/AppDispatcher');
var RunConstants  = require('../constants/RunConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  wentOnline: function() {
    console.log('went online');
    AppDispatcher.handleViewAction({
      type: RunConstants.USER_WENT_ONLINE
    });
  },

  wentOffline: function() {
    console.log('went offline');
    AppDispatcher.handleViewAction({
      type: RunConstants.USER_WENT_OFFLINE
    });
  },

  connect: function() {
    AppDispatcher.handleViewAction({
      type: RunConstants.CONNECT
    });
  },

  executeQuery: function(obj) {
    AppDispatcher.handleViewAction({
      type: RunConstants.EXECUTE_QUERY,
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
      data: data
    });
  }
};
