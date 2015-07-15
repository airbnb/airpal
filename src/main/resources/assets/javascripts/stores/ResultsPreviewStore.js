import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import ResultsPreviewActions from '../actions/ResultsPreviewActions'

class ResultsPreviewStore {
  constructor() {
    // handle store listeners
    this.bindListeners({
      onLoadResultsPreview: ResultsPreviewActions.RECEIVED_RESULTS_PREVIEW,
      onSelectPreviewQuery: ResultsPreviewActions.SELECT_PREVIEW_QUERY,
    });

    // export methods we can use
    this.exportPublicMethods({
      getPreviewQuery: this.getPreviewQuery,
      getResultsPreview: this.getResultsPreview,
    });

    // state
    this.preview = null;
    this.previewQuery = null;
  }

  onSelectPreviewQuery(query) {
    this.previewQuery = query;
  }

  onLoadResultsPreview(preview) {
    this.preview = preview;
  }

  getPreviewQuery() {
    return this.getState().previewQuery;
  }

  getResultsPreview() {
    return this.getState().preview;
  }

}

export default alt.createStore(ResultsPreviewStore, 'ResultsPreviewStore');
