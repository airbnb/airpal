import xhr from './xhr';

let ResultsPreviewApiUtils = {
  loadResultsPreview(file) {
    return xhr(`/api/shorts/${file}`, {
      method: 'get'
    });
  }
};

export default ResultsPreviewApiUtils;
