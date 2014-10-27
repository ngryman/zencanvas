!function(window) {

	var rafId;
	var initialized = false;
	var errorTimeout;
	var hasError = false;

	var canvas = window.canvas = document.querySelector('#scene');
	var context = window.context = window.ctx = canvas.getContext('2d');
	var width, height;

	/**
	 *
	 */

	window.loop = function() {
		rafId = requestAnimationFrame(loop);
		redraw();
	};

	/**
	 *
	 */

	window.noLoop = function() {
		cancelAnimationFrame(rafId);
	};

	/**
	 *
	 */

	window.redraw = function() {
		if ('function' == typeof draw) draw();
	};

	/**
	 *
	 */

	window.resize = function() {
		var style = getComputedStyle(canvas, null);
		width = window.width = canvas.width = parseInt(style.width);
		height = window.height = canvas.height = parseInt(style.height);

		redraw();
	};

	/**
	 *
	 */

	window.background = function(color) {
		canvas.style.backgroundColor = color;
	};

	/**
	 * @private
	 */

	window.inject = function(code) {
		if (!initialized) {
			window.addEventListener('resize', resize);
			resize();

			initialized = true;
		}

		// stops eventual previous loop
		noLoop();
		// resets the canvas state
		canvas.width = canvas.width;
		// clear error notification timeout, perhaps the error is now fixed :)
		clearTimeout(errorTimeout);

		try {
			// evaluates user code
			eval.call(window, code);
		}
		catch(e) {
			errorTimeout = setTimeout(postError, 1000);
			throw e;
		}

		// there was an error, notify that it's gone
		if (hasError) {
			parent.postMessage('alright', '*');
			hasError = false;
		}

		// setup & force a first draw, if user does not use loop()
		if ('function' == typeof setup) setup();
		redraw();
	};

	function postError() {
		parent.postMessage('error', '*');
		hasError = true;
	}

	resize();

}(window);