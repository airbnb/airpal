/** @jsx React.DOM */

var React = require('react'),
    Fqn = require('../fqn'),
    TableSelector = require('./table_selector'),
    PartitionSelector = require('./partition_selector'),
    ColumnsSelector = require('./columns_selector'),
    Tabs = require('../elements/tabs'),
    PreviewTable = require('../elements/preview_table'),
    PartitionedTableSelector;

PartitionedTableSelector = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: 'columns',
    };
  },
  getDefaultProps: function() {
    return {
      onActiveTable: function(schema, table, partition) {},
      activeSchema: 'default',
      activeTable: null,
    };
  },
  render: function() {
    return (<section id="tables-selector" className="row-space-1 dynamic-tabs">
      <div className="row row-space-1">
        <TableSelector
          ref='table'
          onOptionActive={this.onTableOptionActive} />
        <PartitionSelector
          ref='partition'
          onOptionActive={this.onPartitionOptionActive} />
      </div>
      <div className="row-12">
        <Tabs
          selected={this.state.selectedTab}
          onTabChange={this.handleTabChange}>
          <ColumnsSelector
            tabTitle='Columns'
            ref='columns' />
          <PreviewTable
            tabTitle='Preview'
            schema={this.props.activeSchema}
            table={this.props.activeTable} />
        </Tabs>
      </div>
    </section>);
  },
  onTableOptionActive: function($item) {
    var activeTable = null;

    if (!!$item && !!$item.data) {
      activeTable = $item.data('value');
    }

    this.refs.partition.setState({
      activeTable: activeTable
    });

    this.refs.partition.refs.selectize.forceSearch(activeTable);

    this.props.onActiveTable(Fqn.schema(activeTable), Fqn.table(activeTable), null);

    this.refs.columns.setState({
      activeTable: activeTable,
      columns: null
    });
  },
  onPartitionOptionActive: function($item) {
    console.log('saw partition option active', $item, $item.data('value'));
  },
  handleTabChange: function(panel) {
    this.setState({
      selectedTab: panel.props.tabTitle,
    });
  },
});

module.exports = PartitionedTableSelector;
