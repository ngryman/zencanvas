!function(window) {

	var rafId;
	var injectsCount = 0
	var errorTimeout;
	var hasError = false;
	var lastDraw;

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
		rafId = null;
	};

	/**
	 *
	 */

	window.redraw = function() {
		var now = Date.now();
		if ('function' == typeof draw) draw(now - lastDraw);
		lastDraw = now;
	};

	/**
	 *
	 */

	window.resize = function(noredraw) {
		var style = getComputedStyle(canvas, null);
		width = window.width = canvas.width = parseInt(style.width);
		height = window.height = canvas.height = parseInt(style.height);

		if (!noredraw)
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

	function inject(code) {
		if (0 === injectsCount) {
			window.addEventListener('resize', resize);
			resize(true);
		}
		else {
			// stops eventual previous loop
			noLoop();
			// resets the canvas state
			canvas.width = canvas.width;
			// clear error notification timeout, perhaps the error is now fixed :)
			clearTimeout(errorTimeout);
			// clears console
			console.clear();
		}

		// reset last draw
		lastDraw = Date.now();

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
			parent.postMessage({ type: 'success' }, '*');
			hasError = false;
		}

		// teardown & setup & force a first draw, if user does not use loop()
		if (injectsCount > 0 && 'function' == typeof teardown) teardown();
		if ('function' == typeof setup) setup();
		redraw();

		injectsCount++;
	};

	function postError() {
		parent.postMessage({ type: 'error' }, '*');
		hasError = true;
	}

	resize(true);

	window.addEventListener('message', function(e) {
		var message = e.data;

		switch (message.type) {
			case 'code':
				inject(message.data);
				break;
		}
	});

}(window);
