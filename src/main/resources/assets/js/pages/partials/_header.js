/** @jsx React.DOM */
var React = require('react');

var Header = React.createClass({
  displayName: 'Header',

  propTypes: {
    userName: React.PropTypes.string.isRequired,
    accessLevel: React.PropTypes.string.isRequired
  },

  render: function () {
    return (
      <header className="row header-row">

        <div className="col-sm-7">
          <h1>Airpal</h1>
        </div>

        <div className="col-sm-5">
          <div className="row">
            <dl className="col-sm-4">
              <dt>User Name</dt>
              <dd>{this.props.userName}</dd>
            </dl>
            <div className="col-sm-4">
              <p>
                <strong>Access Level &nbsp;</strong>
                <a href="https://airbnb.hackpad.com/Airpal-9FiIU3O2BJ1#:h=Access-Levels" target="_blank">
                  <span className="glyphicon glyphicon-info-sign"></span>
                </a>
                <br />
                {this.props.accessLevel}
              </p>
            </div>
            <div className="col-sm-4 text-right">
              <a href="#" className="btn btn-default" id="start-tour">Take Tour</a>
            </div>
          </div>
        </div>
      </header>
    );
  }
});

module.exports = Header;