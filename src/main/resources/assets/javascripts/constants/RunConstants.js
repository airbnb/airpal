/*
 * RunConstants
 */

var keyMirror = require('keymirror');

module.exports = keyMirror({

  // View constants
  USER_WENT_ONLINE:       null,
  USER_WENT_OFFLINE:      null,
  CONNECT:                null,
  EXECUTE_QUERY:          null,

  // Server constants
  ON_SSE_OPEN:            null,
  ON_SSE_ERROR:           null,
  ON_SSE_MESSAGE:         null
});