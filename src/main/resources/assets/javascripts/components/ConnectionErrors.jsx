var React = require('react/addons');

/* Stores */
var RunStore = require('../stores/RunStore');

var ConnectionErrors = React.createClass({
  displayName: 'ConnectionErrors',

  getInitialState: function() {
    return { offline: false, online: false };
  },

  componentDidMount: function() {
    RunStore.addStoreListener('online', this._wentOnline);
    RunStore.addStoreListener('offline', this._wentOffline);
  },

  componentWillUnmount: function() {
    RunStore.removeStoreListener('online');
    RunStore.removeStoreListener('offline');
  },

  render: function () {
    var cx = React.addons.classSet, classes, alertClasses;

    // Define the main classes
    classes = cx({
      'row': true,
      'connection-errors': true,
      'hidden': (!this.state.online && !this.state.offline)
    });

    // Define the alert classes
    alertClasses = cx({
      'alert': true,
      'alert-success': this.state.online,
      'alert-danger': this.state.offline
    });

    return (
      <div className='container'>
        <div className={classes}>
          <div className={alertClasses}>
            {this.connectionMessage()}
            <button type="button" className="close" onClick={this.handleDismiss}>
              <span>&times;</span>
            </button>
          </div>
        </div>
      </div>
    );
  },

  connectionMessage: function() {
    if( this.state.offline ) {
      return "You're currently offline.";
    } else {
      return "You're re-connected to the internet";
    }
  },

  /* - Event handlers ------------------------------------------------------ */

  // Reset the online and offline state
  handleDismiss: function() {
    this.setState({ online: false, offline: false });
  },

  /* - Internal helpers ---------------------------------------------------- */
  _wentOffline: function() {
    this.setState({ online: false, offline: true });
  },

  _wentOnline: function() {
    this.setState({ online: true, offline: false });
  }
});

module.exports = ConnectionErrors;
