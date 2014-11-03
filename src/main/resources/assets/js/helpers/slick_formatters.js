var numeral = require('numeral'),
    _ = require('lodash');

function RowsProcessedFormatter(row, cell, value, columnDef, dataContext) {
  if (value == null || value === "") {
    return '';
  }

  return numeral(value.processedRows).format('0,0');
}

function DateTimeFormatter(row, cell, value, columnDef, dataContext) {
  var millisUTC;

  if (value == null || value === "") {
    return '';
  }

  millisUTC = _.isNumber(value) ? value : value.millis;

  return (new Date(value)).toISOString();
}

function TimeTakenFormatter(row, cell, value, columnDef, dataContext) {
  if (value == null || value === "" || !value.elapsedTime) {
    return '';
  }

  return value.elapsedTime;
}

function QueryFormatter(row, cell, value, columnDef, dataContext) {
  if (value == null || value === "") {
    return '';
  }

  return '<a href="#" class="job-query" data-row="' + row + '">' +
    $('<code />').text(value).prop('outerHTML') + '</a>';
}

function JobStatusFormatter(row, cell, value, columnDef, dataContext) {
  var output = '';

  if (value == null || value === "") {
    return '';
  }

  switch (value.toLowerCase()) {
    case 'queued':
      output = '<span class="label label-new">Queued</span>';
      break;
    case 'planning':
      output = '<span class="label label-new">Planning</span>';
      break;
    case 'starting':
      output = '<span class="label label-new">Starting</span>';
      break;
    case 'running':
      output = '<span class="label label-info">Running</span>';
      break;
    case 'finished_execution':
      output = '<span class="label label-info">Persisting</span>';
      break;
    case 'finished':
      output = '<span class="label label-success">Finished</span>';
      break;
    case 'canceled':
      output = '<span class="label label-danger">Canceled</span>';
      break;
    case 'failed':
      output = '<span class="label label-danger">Failed</span>';
      break;
  }

  return output;
}

function getProgressFromStats(stats) {
  if (!stats || !stats.totalTasks || stats.totalTasks == 0) {
    return 0.0;
  } else {
    return (stats.completedTasks * 1.0) / (stats.totalTasks * 1.0);
  }
}

function OutputFormatter(row, cell, value, columnDef, dataContext) {
  var progress, progressPercent, displayValue;

  if (dataContext.state.toLowerCase() == 'failed') {
    if (dataContext.error && dataContext.error.message) {
      var lineNumber = 0,
          columnNumber = 0;

      if (dataContext.error.errorLocation) {
        lineNumber = dataContext.error.errorLocation.lineNumber;
        columnNumber = dataContext.error.errorLocation.columnNumber;
      }

      return '<div class="error-cell" data-error-line="' + lineNumber +
        '" data-row="' + row + '"' +
        '" data-error-column="' + columnNumber + '">' +
        dataContext.error.message + '</div>';
    } else {
      return '';
    }
  } else if (value == null || value === "") {
    return '';
  } else if (!value.location) {
    progress = getProgressFromStats(dataContext.queryStats);
    progressPercent = progress * 100.0;
    return '<div class="progress row-space-3" role="progressbar" ' +
      'aria-valuenow="' + progressPercent + '" aria-valuemin="0" ' +
      'aria-valuemax="100"><div class="progress-bar" ' +
      'style="width: ' + progressPercent + '%;"></div></div>';
  }

  if (value.location.indexOf('http') != -1) {
    var tmpLink = document.createElement('a'),
        fileName,
        baseName;
    tmpLink.href = value.location;
    fileName = _.last(tmpLink.pathname.toString().split('/'));
    baseName = fileName.split(baseName)[0];
    displayValue = baseName.substring(0, 22) + '...csv';
  } else {
    displayValue = value.location;
  }

  return '<a href="' + value.location + '" ' +
      'target="_blank" class="job-output" ' +
      'data-row="' + row + '">' +
      displayValue + '</a>';
}

module.exports = {
  RowsProcessed: RowsProcessedFormatter,
  DateTime: DateTimeFormatter,
  TimeTaken: TimeTakenFormatter,
  Query: QueryFormatter,
  JobStatus: JobStatusFormatter,
  Output: OutputFormatter
}
