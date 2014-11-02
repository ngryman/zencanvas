/*!
 * zencanvas
 * Copyright (c) 2014 Nicolas Gryman <ngryman@gmail.com>
 */

'use strict';

/**
 * Dependencies.
 */

var events = require('events');

/**
 * Private.
 */

var iframeEl = document.getElementById('preview')
  , winEl = iframeEl.contentWindow
  , docEl = iframeEl.contentDocument;

/**
 * Preview.
 */

var Preview = Object.create(events.EventEmitter.prototype);

Preview.initialize = function() {
  docEl.body.style.margin = 0;

  var canvasEl = docEl.createElement('canvas');
  canvasEl.id = 'sketch';
  canvasEl.style.width = '100%';
  canvasEl.style.height = '100%';
  docEl.body.appendChild(canvasEl);

  var scriptEl = docEl.createElement('script');
  scriptEl.src = 'runtime.js';
  scriptEl.onload = Preview.emit.bind(Preview, 'ready');
  docEl.body.appendChild(scriptEl);

  window.addEventListener('message', function(e) {
  	var message = e.data;
    Preview.emit('message', message);
  });
};

Preview.inject = function(code) {
  winEl.postMessage({ type: 'code', data: code }, '*');
};

/**
 * Exports.
 */

module.exports = Preview;
