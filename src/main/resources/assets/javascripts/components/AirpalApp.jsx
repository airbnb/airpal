import React from "react";
import RunActions from "../actions/RunActions";
import ConnectionErrors from "./ConnectionErrors.jsx";
import Header from "./Header.jsx";
import TableExplorer from "./TableExplorer.jsx";
import QueryHistory from "./QueryHistory.jsx";
import QueryEditor from "./QueryEditor.jsx";

let AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  componentDidMount() {

    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online',   function() { RunActions.wentOnline(); });
    window.addEventListener('offline',  function() { RunActions.wentOffline(); });
  },

  render() {
    return (
      <div className="airpal-app">
        <ConnectionErrors />
        <Header />
        <TableExplorer />
        <QueryEditor />
        <QueryHistory />
      </div>
    );
  }
});

export default AirpalApp;
