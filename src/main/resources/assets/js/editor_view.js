var ace = require('brace'),
    _ = require('lodash'),
    Placeholder = ace.acequire('ace/placeholder').PlaceHolder,
    Range = ace.acequire('ace/range').Range,
    EventEmitter = require('events').EventEmitter,
    slice = Array.prototype.slice;

require('./lib/jquery.event.drag-2.2');
require('brace/theme/monokai');
require('brace/mode/sql');

var placeholderRE = /\[\[placeholder:[\w-]+\]\]/i,
    defaultPlaceholder = '[[placeholder:PLACEHOLDER_NAME]]',
    placeHolderNameOffset = defaultPlaceholder.indexOf(':') + 1;

function containsPlaceHolder(text) {
  return placeholderRE.test(text);
}

function TemplateCreator(editor) {
  this.editor = editor;
  this.session = editor.getSession();
  this.initialize();
}

function rangeStartEndSame(start, end) {
  return !!start && !!end &&
    (start.row === end.row) &&
    (start.column === end.column);
}

_.extend(TemplateCreator.prototype, {
  initialize: function() {
    this.editor.session.on('change', _.bind(function() {
    }, this));
    this.editor.commands.addCommand({
      name: 'insertPlaceholder',
      bindKey: {
        win: 'Ctrl-I',
        mac: 'Command-I'
      },
      exec: _.bind(this.insertPlaceholder, this),
      readOnly: false
    });
  },
  insertPlaceholder: function(editor) {
    var cursor = editor.selection.getCursor(),
        placeholder;

    console.log('inserting placeholder', editor, arguments, this,
                'cursor', cursor,
                'Placeholder', Placeholder);

    editor.insert(defaultPlaceholder);
    editor.getSelection().setSelectionRange(
      new Range(cursor.row,
                cursor.column + placeHolderNameOffset,
                cursor.row,
                cursor.column + defaultPlaceholder.length - 2));
  }
});

function EditorView($editor, $container, $handle, canBuildTemplate) {
  this.$editor = $editor;
  this.$container = $container;
  this.$handle = $handle;
  this.rendered = false;
  this.canBuildTemplate = canBuildTemplate || true;

  this._emitter = new EventEmitter();
}

_.extend(EditorView.prototype, {
  on: function() {
    return this._emitter.on.apply(this._emitter, slice.call(arguments, 0));
  },
  render: function(canBuildTemplate) {
    var editor;

    if (!!this.rendered)
      return this;

    editor = ace.edit(this.$editor.attr('id'));
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/sql');

    this.editor = editor;
    this.rendered = true;
    this._installTemplateCreator();
    this._installResize();

    this.editor.selection.on('changeSelection', _.debounce(function(evt, selection) {
      var range = selection.getRange(),
          rangeSelected = !rangeStartEndSame(range.start, range.end),
          eventMessage = { range: false };

      if (rangeSelected) {
        eventMessage.range = true;
        eventMessage.text = this.getQuery();
      }

      console.log('[DEBOUNCED changeSelection]', range, eventMessage);

      this._emitter.emit('selection', eventMessage);
    }.bind(this), 150, {
      maxWait: 150,
    }));
  },
  getValue: function() {
    return this.editor.getValue();
  },
  getQuery: function() {
    var range = this.editor.selection.getRange(),
        rangeSelected = !rangeStartEndSame(range.start, range.end);

    if (rangeSelected) {
      return this.editor.session.getTextRange(range);
    } else {
      return this.getValue();
    }
  },
  setValue: function(val) {
    return this.editor.setValue(val);
  },
  setValueWithPlaceholders: function(val) {
  },
  _installResize: function() {
    var editor = this.editor;

    this.$container.
      drag('start', resizeDragStart(this.$editor)).
      drag(resizeDrag(this.$editor), {handle: this.$handle}).
      drag('end', function(ev, dd) { editor.resize(true); });
  },
  _installTemplateCreator: function() {
    if (!this.canBuildTemplate || !!this.templateCreator) {
      return;
    }

    this.templateCreator = new TemplateCreator(this.editor);
  },
});

function resizeDragStart($input) {
  return function(ev, dd) {
    var $this = $(this);

    _.extend(dd, {
      width: $this.width(),
      height: $this.height(),
      labelHeight: $this.find('.panel-top-content').outerHeight(),
    });

    dd.minHeight = dd.labelHeight + parseInt($input.css('min-height'));
  };
}

function resizeDrag($input) {
  return function(ev, dd){
    var controlGroupHeight = Math.max(dd.minHeight, dd.height + dd.deltaY),
        controlLabelHeight = dd.labelHeight;

    $(this).css({
      height: controlGroupHeight
    });
    $input.css({
      height: controlGroupHeight - controlLabelHeight
    });
  };
}

module.exports = {
  EditorView: EditorView
}
