import xhr from './xhr';

let ResultsPreviewApiUtils = {
  loadResultsPreview(file) {
    return xhr(`/api/preview?fileURI=${encodeURIComponent(file)}`, {
      method: 'get'
    });
  }
};

export default ResultsPreviewApiUtils;
