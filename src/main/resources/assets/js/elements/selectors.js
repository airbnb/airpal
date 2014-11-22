/** @jsx React.DOM */
var React             = require('react'),

    // Elements
    ColumnsPreview    = require('./columns_preview'),
    DataPreview       = require('./data_preview'),
    MetaDataPreview   = require('./meta_data_preview'),

    PartitionSelector = require('./partition_selector'),
    TableSelector     = require('./table_selector'),

    TabbedArea        = require('./tabbed_area'),
    TabPane           = require('./tab_pane'),

    // Helpers
    FQN               = require('../helpers/fqn'),

    // Third party libs
    _                 = require('lodash');

var Selectors = React.createClass({

  getInitialState: function() {
    return {
      selectedTab: 'columns',
      collection: []
    };
  },

  componentDidMount: function() {

    Mediator.on('addSearchItem', function(table, $element, type) {
      this._addItem(table, $element, type);
    }.bind(this));

    Mediator.on('selectSearchItem', function(element, type) {
      this._selectItem(element, type);
    }.bind(this));

    Mediator.on('removeSearchItem', function(table, type) {
      this._removeItem(table, type);
    }.bind(this));

    Mediator.on('newCollection', function(collection) {
      this.setState({ collection: collection });
    }.bind(this));
  },

  render: function() {
    return (
      <section className="row tables-selector-row">
        <div className="col-sm-12">
          <div className="row">
            <TableSelector ref='table' />
            <PartitionSelector ref='partition' />
          </div>
        </div>

        <TabbedArea name="table-selector" selectedTab={this.state.selectedTab} onTabChange={this.handleTabChange}>

          <TabPane key={1} name="Columns" selectedTab={this.state.selectedTab}>
            <ColumnsPreview ref="columns" />
          </TabPane>

          <TabPane key={2} name="Preview" selectedTab={this.state.selectedTab}>
            <DataPreview ref="preview" />
          </TabPane>

          <TabPane key={3} name="Metadata" selectedTab={this.state.selectedTab}>
            <MetaDataPreview ref="metadata" />
          </TabPane>

        </TabbedArea>

      </section>
    );
  },

  /* Event Handlers --------------------------------------------------------- */
  handleTabChange: function(tab) {
    this.setState({ selectedTab: tab.props.name });
  },

  /* Internal Helpers ------------------------------------------------------- */
  _addItem: function(table, $element, type) {
    if( type === 'table' ) {
      this._addTableItem(table, $element);
    } else {
      this._addPartitionItem(table, $element);
    }
  },

  _selectItem: function(element, type) {
    if( type === 'table' ) {
      this._selectTableItem(element);
    } else {
      this._selectPartitionItem(element);
    }
  },

  _removeItem: function(table, type) {
    if( type === 'table' ) {
      this._removeTableItem(table);
    } else {
      this._removePartitionItem(table);
    }
  },

  _addTableItem: function(table, $element) {
    var localModel, model, collection;

    // Activate the partition search
    this.refs.partition.setState({ activeTable: table });
    this.refs.partition.refs.selectize.enable();

    // Find out or we need to add the table
    localModel = _.findWhere(this.state.collection, table);
    if( localModel ) {
      Mediator.emit('newModel', localModel);
    } else {

      // Create the new model
      model = this._createNewModel(table);

      // Updat the collection with the new model
      collection = _.clone(this.state.collection);
      collection.push(model);

      // Add the new model to the collection and to the current state
      Mediator.emit('newModel', model);
      Mediator.emit('newCollection', collection);

      // Fetch the data for this model
      model.fetch();
    }

    // Trigger the onActiveTable callback
    // this.props.onActiveTable(Fqn.schema(data), Fqn.table(data), null);
  },

  _selectTableItem: function(element) {

    // Change tables when an item is selected. If the element is null,
    // we pick the first table in the this.state.collection
    if( element === null ) {
      Mediator.emit('newModel', _.first(this.state.collection));
    } else {

      // Get the table from the element and set it
      var table = $(element).data('value');
      Mediator.emit('newModel', _.findWhere(this.state.collection, { name: table }));
    }
  },

  _removeTableItem: function(table) {
    var newCollection, newModel;

    // Remove the current table from the collection
    newCollection = _.filter(this.state.collection, function(model) {
      return model.name !== table
    });

    // Select the new model
    newModel = ( newCollection.length ) ? _.first(newCollection) : null;

    // Set the new state for the current view
    Mediator.emit('newCollection', newCollection);
    Mediator.emit('newModel', newModel);
  },

  _createNewModel: function(table) {
    var model = {};

    // Setup the name for this model
    model.name = table;
    model.url = this._createModelUrl(table);

    // Create a fetch functionality for the model
    var that = this;
    model.fetch = function() {
      $.when( that._fetchColumData(model), that._fetchPreviewData(model) )
        .then(function(columnArr, dataArr) {

          // Extend the current model with the new data
          _.extend(this, { columns: columnArr[0], data: dataArr[0] });

          // Notify the application about the new model data
          Mediator.emit('newModel', this);
        }.bind(this));
    };

    // Return the new model
    return model;
  },

  _createModelUrl: function(name) {

    // Define the url basics
    var schema = FQN.schema(name),
        table = FQN.table(name);

    // Generate the base url
    return '/api/table/' + schema + '/' + table;
  },

  _fetchColumData: function(model) {
    return $.ajax({
      type: 'GET',
      url: model.url + '/columns'
    })
  },

  _fetchPreviewData: function(model) {
    return $.ajax({
      type: 'GET',
      url: model.url + '/preview'
    });
  }
});

module.exports = Selectors;
