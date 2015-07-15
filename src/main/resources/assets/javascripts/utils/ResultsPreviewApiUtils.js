import xhr from './xhr';

let ResultsPreviewApiUtils = {
  loadResultsPreview(file) {
    return xhr(`/api/preview/${file}`, {
      method: 'get'
    });
  }
};

export default ResultsPreviewApiUtils;
