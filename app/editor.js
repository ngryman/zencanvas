/*!
 * zencanvas
 * Copyright (c) 2014 Nicolas Gryman <ngryman@gmail.com>
 */

'use strict';

/**
 * Dependencies.
 */

var events = require('events')
  , CodeMirror = require('codemirror');

require('../node_modules/codemirror/mode/javascript/javascript.js');
require('../node_modules/codemirror/addon/edit/closebrackets.js');
require('../node_modules/codemirror/addon/edit/matchbrackets.js');

/**
 * Private.
 */

var editor
  , editorEl = document.getElementById('editor')
  , dockSide = 'center'
  , debounceTimeout
  , hasError = false;

/**
 * Editor.
 */

var Editor = Object.create(events.EventEmitter.prototype);

Editor.initialize = function() {
  editor = CodeMirror(function(el) {
    editorEl.appendChild(el);
  }, {
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    value: localStorage.getItem('editor_autosave') || '',
    extraKeys: {
      'Ctrl-Alt-Left': dock('left', 'right'),
      'Ctrl-Alt-Right': dock('right', 'left')
    }
  });

  editor.on('change', function() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function() {
      var code = editor.getValue();
      localStorage.setItem('editor_autosave', code);

      Editor.emit('change', code);
    }, 300);
  });

  var storedDockSide = localStorage.getItem('dock_side');
  if ('left' == storedDockSide)
  	dock('left', 'right')(editor);
  else if ('right' == storedDockSide)
  	dock('right', 'left')(editor);
};

Object.defineProperty(Editor, 'code', {
  get: function() {
    return editor.getValue();
  }
});

Object.defineProperty(Editor, 'hasError', {
  get: function() {
    return hasError;
  },
  set: function(val) {
    hasError = val;
    if (hasError)
      editorEl.classList.add('has-error');
    else
      editorEl.classList.remove('has-error');
  }
});

function dock(side, opSide) {
	return function(cm) {
		document.body.classList.remove('dock-' + dockSide);
		if (opSide == dockSide)
			document.body.classList.remove('dock');
		else
			document.body.classList.add('dock', 'dock-' + side);
		cm.refresh();
		dockSide = side;
		localStorage.setItem('dock_side', dockSide);
	};
}

/**
 * Exports.
 */

module.exports = Editor;
