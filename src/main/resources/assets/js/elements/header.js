/** @jsx React.DOM */
var React          = require('react'),
    EventEmitter   = require('events').EventEmitter;

var Header = React.createClass({
  displayName: 'Header',

  getInitialState: function() {
    return { user: {} };
  },

  componentDidMount: function() {

    // Listen to the mediator events
    // Set the state user if we've got a new user through the EventEmitter
    Mediator.on('addUser', function(user) {
      this.setState({ user: user });
    }.bind(this));
  },

  render: function () {
    return (
      <header className="row header-row">

        <div className="col-sm-7">
          <h1>Airpal</h1>
        </div>

        <div className="col-sm-5">

          <div className="row">
            <div className="col-sm-4">
              <dl>
                <dt>User Name</dt>
                <dd>{this.state.user.username}</dd>
              </dl>
            </div>

            <div className="col-sm-4">
              <p>
                <strong>Access Level &nbsp;</strong>
                <a href="https://airbnb.hackpad.com/Airpal-9FiIU3O2BJ1#:h=Access-Levels" target="_blank"
                  data-toggle="tooltip" data-placement="bottom" title="For more info about the access rights, see the HackPad">
                  <span className="glyphicon glyphicon-info-sign"></span>
                </a>
                <br />
                {this.state.user.accessLevel}
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
