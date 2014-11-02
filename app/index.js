/*!
 * zencanvas
 * Copyright (c) 2014 Nicolas Gryman <ngryman@gmail.com>
 */

'use strict';

/**
 * Dependencies.
 */

var Preview = require('./preview')
  , Editor = require('./editor');

/**
 * Application.
 */

var App = {};

App.start = function() {
  Editor.initialize();
  Preview.initialize();

  Editor.on('change', Preview.inject);

  Preview.on('ready', function() {
    Preview.inject(Editor.code);
  })
  .on('message', handleMessage);
};

function handleMessage(message) {
  switch (message.type) {
    case 'error':
      Editor.hasError = true;
      break;

    case 'success':
      Editor.hasError = false;
      break;
  }
}

/**
 * Exports.
 */

window.app = App;
