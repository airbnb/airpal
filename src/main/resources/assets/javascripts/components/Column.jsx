import React from 'react';
import _ from 'lodash';

let Column = React.createClass({
  displayName: 'Column',

  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },

  render() {
    // Return the template
    return (
      <div>
        <div className="flex justify-flex-end column-item">
          <div className='flex'>
            <strong>{this.props.name}</strong>
          </div>
          <div>
            <small>{this.props.type} {this.props.partition ? '(Partition)' : null}</small>
          </div>
        </div>
      </div>
    );
  }
});

export default Column;
