import alt from '../alt';
import ResultsPreviewApiUtils from '../utils/ResultsPreviewApiUtils'
import logError from '../utils/logError'

class ResultsPreviewActions {
  constructor() {
    this.generateActions(
      'receivedResultsPreview',
      'selectPreviewQuery',
      'clearResultsPreview'
    );
  }

  loadResultsPreview(file) {
    ResultsPreviewApiUtils.loadResultsPreview(file).then((results) => {
      this.actions.receivedResultsPreview(results);
    }).catch(logError);
  }

  setTableColumnWidth(columnIdx, width) {
    this.dispatch({ columnIdx, width });
  }
}

export default alt.createActions(ResultsPreviewActions);
