import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import ResultsPreviewActions from '../actions/ResultsPreviewActions'

class ResultsPreviewStore {
  constructor() {
    // handle store listeners
    this.bindListeners({
      onLoadResultsPreview: ResultsPreviewActions.RECEIVED_RESULTS_PREVIEW,
    });

    // export methods we can use
    this.exportPublicMethods({
      getResultsPreview: this.getResultsPreview
    });

    // state
    this.preview = null;
  }

  onLoadResultsPreview(preview) {
    this.preview = preview;
  }

  getResultsPreview() {
    return this.getState().preview;
  }
}

export default alt.createStore(ResultsPreviewStore, 'ResultsPreviewStore');
