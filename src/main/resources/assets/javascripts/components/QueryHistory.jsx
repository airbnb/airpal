import React from "react";
import QueryInformation from "./QueryInformation.jsx";

let QueryHistory = React.createClass({
  render() {
    return (
      <div className='panel panel-default panel-container'>
        <div className='panel-heading'>
          <h3 className='panel-title'>
            Query history
          </h3>
        </div>
        <QueryInformation />
      </div>
    );
  }
});

export default QueryHistory;
