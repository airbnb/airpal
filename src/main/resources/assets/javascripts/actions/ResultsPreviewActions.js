import alt from '../alt';
import ResultsPreviewApiUtils from '../utils/ResultsPreviewApiUtils'
import logError from '../utils/logError'

class ResultsPreviewActions {
  constructor() {
    this.generateActions(
      'receivedResultsPreview',
      'selectPreviewQuery'
    );
  }

  loadResultsPreview(file) {
    ResultsPreviewApiUtils.loadResultsPreview(file).then((results) => {
      this.actions.receivedResultsPreview(results);
    }).catch(logError);
  }
}

export default alt.createActions(ResultsPreviewActions);
