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
  , dockPos = localStorage.getItem('dock_pos') || 0
  , debounceTimeout
  , hasError = false;

var dockClasses = {
  '-1': 'dock-left',
   '0': '',
   '1': 'dock-right'
};

/**
 * Editor.
 */

var Editor = Object.create(events.EventEmitter.prototype);

Editor.initialize = function() {
  editor = CodeMirror(function(el) {
    editorEl.appendChild(el);
  }, {
    theme: 'monokai',
    // lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    value: localStorage.getItem('editor_autosave') || '',
    extraKeys: {
      'Ctrl-Alt-Left': dock.bind(null, -1),
      'Ctrl-Alt-Right': dock.bind(null, +1)
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

  // if (-1 == dockPos)
  // 	dock('left', 'right')(editor);
  // else if ('right' == dockSide)
  // 	dock('right', 'left')(editor);
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

function dock(dir) {
  var className;

  if ((dockPos + dir < -1) || (dockPos + dir > +1)) return;

  className = dockClasses[dockPos];
  if (className) {
    document.body.classList.remove(dockClasses[dockPos]);
    document.body.classList.remove('dock');
  }

  dockPos += dir;

  className = dockClasses[dockPos]
  if (className) {
    document.body.classList.add(dockClasses[dockPos]);
    document.body.classList.add('dock');
  }
}

// function dock(side, opSide) {
// 	return function(cm) {
// 		document.body.classList.remove('dock-' + dockSide);
//
// 		if (opSide == dockSide) {
// 			document.body.classList.remove('dock');
//       dockSide = side;
//     }
// 		else {
// 			document.body.classList.add('dock', 'dock-' + side);
//       dockSide = 'center';
//     }
//
// 		cm.refresh();
// 		localStorage.setItem('dock_side', dockSide);
// 	};
// }

/**
 * Exports.
 */

module.exports = Editor;
