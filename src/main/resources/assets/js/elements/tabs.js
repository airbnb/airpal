/** @jsx React.DOM */

var React = require('react'),
    Tabs,
    TabPanel,
    TabButton;

TabButton = React.createClass({
  getDefaultProps: function() {
    return {
      name: '',
      selected: false,
      panelName: '',
    };
  },
  render: function() {
    return (<li>
      <a className="tab-item"
         aria-controls={this.props.panelName}
         aria-selected={this.props.selected}
         onClick={null}>{this.props.name}</a>
    </li>);
  },
});

Tabs = React.createClass({
  getDefaultProps: function() {
    return {
      panels: [],
      selected: null,
      onTabChange: function(panel) {},
    };
  },
  render: function() {
    var tabItems, tabPanels;

    tabItems = React.Children.map(this.props.children, function(child) {
      var title = child.props.tabTitle
          panelTitle = title.toLowerCase(),
          panelName = 'panel-' + panelTitle,
          panelSelected = (panelTitle === this.props.selected.toLowerCase());

      return <li key={panelName}>
        <a className="tab-item"
           aria-controls={panelName}
           aria-selected={panelSelected}
           onClick={this.handleTabClick.bind(this, child)}>{title}</a>
       </li>;
    }.bind(this));

    tabPanels = React.Children.map(this.props.children, function(child) {
      var title = child.props.tabTitle,
          panelTitle = title.toLowerCase(),
          panelName = 'panel-' + panelTitle,
          panelKey = 'tab-' + panelName,
          panelSelected = (panelTitle === this.props.selected.toLowerCase());

      return <div id={panelName}
                  className="tab-panel panel-body"
                  key={panelKey}
                  aria-hidden={!panelSelected}>
        {child}
      </div>;
    }.bind(this));

    return (
      <div className='panel'>
        <ul className='tabs panel-header tabs-header' ref='tabs'>
          {tabItems}
        </ul>
        {tabPanels}
      </div>
    );
  },
  handleTabClick: function(panel, e) {
    console.log('handleTabClick', panel, e, arguments, this);
    e.preventDefault();
    this.props.onTabChange(panel);
  },
});

module.exports = Tabs;
