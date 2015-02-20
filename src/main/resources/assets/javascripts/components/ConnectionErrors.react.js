/** @jsx React.DOM */

/**
 * Dependencies
 */
var React = require('react/addons');

/**
 * Stores
 */
var RunStore = require('../stores/RunStore');


var ConnectionErrors = React.createClass({
  displayName: 'ConnectionErrors',

  getInitialState() {
    return {
      offline: false,
      online: false
    };
  },

  componentDidMount() {
    RunStore.addStoreListener('online', this._wentOnline);
    RunStore.addStoreListener('offline', this._wentOffline);
  },

  componentWillUnmount() {
    RunStore.removeStoreListener('online');
    RunStore.removeStoreListener('offline');
  },

  render() {
    var cx = React.addons.classSet;

    // Define the main classes
    var classes = cx({
      'row': true,
      'connection-errors': true,
      'hidden': (!this.state.online && !this.state.offline)
    });

    // Define the alert classes
    var alertClasses = cx({
      'alert': true,
      'alert-success': this.state.online,
      'alert-danger': this.state.offline
    });

    return (
      <div className={classes}>
        <div className={alertClasses}>
          {this.connectionMessage()}
          <button type="button" className="close" onClick={this.handleDismiss}>
            <span>&times;</span>
          </button>
        </div>
      </div>
    );
  },

  connectionMessage() {
    if(this.state.offline) {
      return "You're currently offline.";
    } else {
      return "You're re-connected to the internet";
    }
  },

  // Reset the online and offline state
  handleDismiss() {
    this.setState({
      online: false,
      offline: false
    });
  },

  _wentOffline() {
    this.setState({
      online: false,
      offline: true
    });
  },

  _wentOnline() {
    this.setState({
      online: true,
      offline: false
    });
  }
});

module.exports = ConnectionErrors;
