/** @jsx React.DOM */
var React             = require('react'),

    // Helpers
    Fqn               = require('../../fqn'),

    // Elements
    ColumnsSelector   = require('../../elements/columns_selector'),
    PartitionSelector = require('../../elements/partition_selector'),
    PreviewTable      = require('../../elements/preview_table'),
    TabbedArea        = require('../../elements/tabbed_area'),
    TabPane           = require('../../elements/tab_pane'),
    TableSelector     = require('../../elements/table_selector');

var PartitionedTableSelector = React.createClass({

  getInitialState: function() {
    return {
      selectedTab: 'Columns',
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
    return (
      <section id="tables-selector" className="row tables-selector-row">
        <div className="col-sm-12">
          <div className="row">
            <TableSelector ref='table' onOptionActive={this.onTableOptionActive} />
            <PartitionSelector ref='partition' onOptionActive={this.onPartitionOptionActive} />
          </div>
        </div>

        <TabbedArea name="table-selector" selectedTab={this.state.selectedTab} onTabChange={this.handleTabChange}>

          <TabPane key={1} name="Columns" selectedTab={this.state.selectedTab}>
            <ColumnsSelector ref='columns' />
          </TabPane>

          <TabPane key={2} name="Preview" selectedTab={this.state.selectedTab}>
            <PreviewTable ref='preview' schema={this.props.activeSchema} table={this.props.activeTable} />
          </TabPane>

        </TabbedArea>

      </section>
    );
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

  handleTabChange: function(tab) {
    this.setState({ selectedTab: tab.props.name });
  }
});

module.exports = PartitionedTableSelector;
