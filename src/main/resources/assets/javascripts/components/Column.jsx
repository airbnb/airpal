import React from "react";
import _ from "lodash";

let Column = React.createClass({
  displayName: 'Column',

  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },

  render() {
    // Return the template
    return (
      <div className="col-sm-3">
        <div className="panel panel-default panel-compressed">

          <div className="panel-body">
            <strong>{this.props.name}</strong> ({this.props.type}) {
              this.props.partition ? '(Partition)' : null}
          </div>

        </div>
      </div>
    );
  }
});

export default Column;
