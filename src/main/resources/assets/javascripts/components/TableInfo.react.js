/** @jsx React.DOM */
var React = require('react');

/* Component */
var TabbedArea  = require('react-bootstrap').TabbedArea,
    TabPane     = require('react-bootstrap').TabPane,
    Columns     = require('./Columns.react'),
    DataPreview = require('./DataPreview.react'),
    MetaDataPreview = require('./MetaDataPreview.react');

var TableInfo = React.createClass({
  displayName: 'TableInfo',
  render: function () {
    return (
      <section className="row tables-selector-row">
        <div className="col-sm-12">
          <TabbedArea defaultActiveKey={1}>

            <TabPane eventKey={1} tab="Columns">
              <div className="row columns-row">
                <div className="col-sm-12 column-selector">
                  <Columns />
                </div>
              </div>
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