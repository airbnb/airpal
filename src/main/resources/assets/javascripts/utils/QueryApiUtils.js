/**
 * QueryApiUtils
 */

var Queries = [
  {
    "user": "test",
    "query": "SELECT COUNT(*) FROM some_table",
    "uuid": "AFEU-4f85-FGHE-8345",
    "output": {
      "type": "csv",
      "description": "",
      "location": "https://some.url/link/to.csv"
    },
    "queryStats": {
      "analysisTime": "372.76ms",
      "completedDrivers": 5013,
      "completedTasks": 99,
      "createTime": 1417020450821,
      "distributedPlanningTime": "1.14ms",
      "elapsedTime": "2.26m",
      "endTime": 1417020586667,
      "executionStartTime": 1417020451197,
      "lastHeartbeat": 1417020586771,
      "outputDataSize": "5.86kB",
      "outputPositions": 188,
      "processedInputDataSize": "438.12MB",
      "processedInputPositions": 13238777,
      "queuedDrivers": 0,
      "queuedTime": "189.92us",
      "rawInputDataSize": "1.22GB",
      "rawInputPositions": 13247834,
      "runningDrivers": 0,
      "runningTasks": 0,
      "totalBlockedTime": "1.03d",
      "totalCpuTime": "0.00ns",
      "totalDrivers": 5013,
      "totalMemoryReservation": "0B",
      "totalPlanningTime": "374.19ms",
      "totalScheduledTime": "2.52h",
      "totalTasks": 99,
      "totalUserTime": "0.00ns"
    },
    "state": "FINISHED",
    "columns": [],
    "tablesUsed": [
      {
        "connectorId": "hive",
        "schema": "default",
        "table": "some_table"
      }
    ],
    "queryStarted": 1417020587000,
    "queryFinished": 1417020587001,
    "error": null,
  }
];


/* Actions */
var QueryActions = require('../actions/QueryActions');

/* Helpers */
var _ = require('lodash');

module.exports = {

  getQuery: function(id) {
    $.ajax({
      type: 'GET',
      url: './api/queries/' + id,

      success: function(query) {
        QueryActions.receivedQuery(query);
      }
    });
  },

  getAllQueries: function() {
    $.ajax({
      type: 'GET',
      url: './api/queries',

      success: function(queries) {
        QueryActions.receivedQueries(queries);
      }
    });
  },

  getUserQueries: function(name) {
    $.ajax({
      type: 'GET',
      url: './api/users/' + name + '/queries',

      success: function(queries) {
        QueryActions.receivedQueries(Queries);
      }
    });
  },

  createQuery: function(data) {
    $.ajax({
      type: 'POST',
      url: './api/query/saved',
      data: data,

      success: function(uuid) {
        // TODO: currently the API only returns the uuid, but I also want the
        // name and the description. So we're merging the uuid into the data
        // object
        var query = _.extend(data, { uuid: uuid });
        QueryActions.receivedQuery(query);
      }
    });
  },

  updateQuery: function(id, data) {
    $.ajax({
      type: 'PATCH',
      url: './api/queries/' + id,
      data: data,

      success: function(query) {
        QueryActions.receivedUpdatedQuery(id, query);
      }
    });
  },

  destroyQuery: function(id) {
    $.ajax({
      type: 'DELETE',
      url: './api/queries/' + id,

      success: function() {
        QueryActions.receivedDestroyedQuery(id);
      }
    });
  }
};