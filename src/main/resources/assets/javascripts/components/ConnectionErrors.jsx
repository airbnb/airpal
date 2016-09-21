import React from 'react/addons';
import RunActions from '../actions/RunActions';
import RunStore from '../stores/RunStore';

let ConnectionErrors = React.createClass({
  getInitialState() {
    return RunStore.getState();
  },

  componentDidMount() {
    RunStore.listen(this._changeStatus);

    // Hide the alert 5 seconds later.
    setTimeout(() => RunActions.resetOnlineStatus(), 5000);
  },

  componentWillUnmount() {
    RunStore.unlisten(this._changeStatus);
  },

  render() {
    let cx = React.addons.classSet;

    // Define the main classes
    let classes = cx({
      'row': true,
      'connection-errors': true,
      'hidden': (!this.state.online && !this.state.offline)
    });

    // Define the alert classes
    let alertClasses = cx({
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
    if (this.state.offline) {
      return "You're currently offline.";
    } else {
      return "You're re-connected to the internet";
    }
  },

  /* - Event handlers ------------------------------------------------------ */

  // Reset the online and offline state
  handleDismiss() {
    RunActions.resetOnlineStatus();
  },

  _changeStatus() {
    this.setState(RunStore.getState());
  }
});

export default ConnectionErrors;
