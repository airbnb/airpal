/** @jsx React.DOM */
var React           = require('react'),
    _               = require('lodash'),
    SelectizeInput  = require('./selectize_input'),
    Fqn             = require('../helpers/fqn');

var PartionSelector = React.createClass({
  displayName: 'PartionSelector',

  getInitialState: function() {
    return { model: null };
  },

  componentDidMount: function() {
    Mediator.on('newModel', function(model) {
      this.setState({ model: model });
    }.bind(this));
  },

  render: function () {
    return (
      <form className="col-sm-5" role="form">
        <div className="form-group">
          <label htmlFor="tables-input">Partition</label>
          <SelectizeInput
            ref="selectize"
            disabled="true"
            placeholder="Select a partition..."
            selectizeOptions={this._selectizeOptions} />
        </div>
      </form>
    );
  },

  /* Internal Helpers ------------------------------------------------------- */
  _selectizeOptions: function() {
    return {
      maxItems: 1,
      preload: 'focus',
      load: this._loadOptions,
      render: { option: this._renderOptions },
      valueField: 'value',
      labelField: 'fqn',
      searchField: ['value', 'name', 'fqn'],
      sortField: [
        { field: 'value', direction: 'desc' },
        { field: 'name', direction: 'asc' }
      ],
      loadThrottle: 25,
      plugins: {
        'remove_button': {},
        'header': {
          headers: ['Partition', 'Last Updated']
        }
      },

      onItemAdd: function(table, $element) {
        Mediator.emit('addSearchItem', table, $element, 'partition');
        this.refs.selectize.close();
      }.bind(this),

      onItemRemove: function(table) {
        Mediator.emit('removeSearchItem', table, 'partition');
        this.refs.selectize.close();
      }.bind(this),

      onItemSelected: function($element) {
        Mediator.emit('selectSearchItem', $element, 'partition');
        this.refs.selectize.close();
      }.bind(this)
    };
  },

  _loadOptions: function(query, callback) {
    if( this.state.model == null ) {
      this.refs.selectize.$selectize.disable(); // Make sure the select box is disabled
      callback();
    }

    // Define the URL for this object
    var url = './api/table/' + Fqn.schema(this.state.model) + '/' +
      Fqn.table(this.state.model) + '/partitions';

    $.ajax({
      url: url,
      type: 'GET',

      error: function() { callback(); },

      success: function(res) {
        if( _.isEmpty(res) ) { callback(); }

        // Format the result
        var result = _.map(res, function(record, idx) {
          return _.extend({
            fqn: [record.name, record.value].join('=')
          }, record);
        });

        callback(result);
      }.bind(this)
    });
  },

  _renderOptions: function(item, escape) {
    return (
      '<div class="row">' +
        '<div class="col-sm-6"><p>' + escape(item.fqn) + '</p></div>' +
        ( item.lastUpdated !== null ? '<div class="col-sm-6"><p>' + escape(moment(new Date(item.lastUpdated)).format('MMM Do YYYY, h:mm:ss a z')) + '</p></div>' : '' ) +
      '</div>'
    );
  }
});

module.exports = PartionSelector;
