/** @jsx React.DOM */
var React = require('react');

/* Component */
var TabbedArea      = require('react-bootstrap').TabbedArea,
    TabPane         = require('react-bootstrap').TabPane,
    ColumnsPreview  = require('./ColumnsPreview.react'),
    DataPreview     = require('./DataPreview.react'),
    MetaDataPreview = require('./MetaDataPreview.react');

var TableInfo = React.createClass({
  displayName: 'TableInfo',
  render: function () {
    return (
      <section className="row spaced tables-selector-row">
        <div className="col-sm-12">
          <TabbedArea defaultActiveKey={1} animation={false}>

            <TabPane eventKey={1} tab="Columns">
              <ColumnsPreview />
            </TabPane>

            <TabPane eventKey={2} tab="Data Preview">
              <DataPreview />
            </TabPane>

            <TabPane eventKey={3} tab="Meta data">
              <MetaDataPreview />
            </TabPane>

          </TabbedArea>
        </div>
      </section>
    );
  }
});

module.exports = TableInfo;