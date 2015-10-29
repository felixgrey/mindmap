define(function(require, exports, module) {

	/* ======================================================================
	 copy from OpenLayers/Util/vendorPrefix.js
	 ====================================================================== */

	/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
	 * full list of contributors). Published under the 2-clause BSD license.
	 * See license.txt in the OpenLayers distribution or repository for the
	 * full text of the license. */

	var vendorPrefix = ( function() {"use strict";

			var VENDOR_PREFIXES = ["", "O", "ms", "Moz", "Webkit"], jsCache = {};

			/**
			 * APIMethod: js
			 * Detect which property is used for a JS property/method
			 *
			 * Parameters:
			 * obj - {Object} The object to test on
			 * property - {String} The standard (unprefixed) JS property name
			 *
			 * Returns:
			 * {String} The standard JS property, prefixed property or null if not
			 *          supported
			 */
			function js(obj, property) {
				if (jsCache[property] === undefined) {
					var tmpProp, i = 0, l = VENDOR_PREFIXES.length, prefix, isStyleObj = ( typeof obj.cssText !== "undefined");

					jsCache[property] = null;
					for (; i < l; i++) {
						prefix = VENDOR_PREFIXES[i];
						if (prefix) {
							if (!isStyleObj) {
								// js prefix should be lower-case, while style
								// properties have upper case on first character
								prefix = prefix.toLowerCase();
							}
							tmpProp = prefix + property.charAt(0).toUpperCase() + property.slice(1);
						} else {
							tmpProp = property;
						}

						if (obj[tmpProp] !== undefined) {
							jsCache[property] = tmpProp;
							break;
						}
					}
				}
				return jsCache[property];
			}

			return {
				js : js
			};
		}());

	/* ======================================================================
	copy from OpenLayers/Animation.js
	====================================================================== */

	/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
	* full list of contributors). Published under the 2-clause BSD license.
	* See license.txt in the OpenLayers distribution or repository for the
	* full text of the license. */

	/**
	 * Property: isNative
	 * {Boolean} true if a native requestAnimationFrame function is available
	 */
	var requestAnimationFrame = vendorPrefix.js(window, "requestAnimationFrame");
	var isNative = !!(requestAnimationFrame);

	/**
	 * Function: requestFrame
	 * Schedule a function to be called at the next available animation frame.
	 *     Uses the native method where available.  Where requestAnimationFrame is
	 *     not available, setTimeout will be called with a 16ms delay.
	 *
	 * Parameters:
	 * callback - {Function} The function to be called at the next animation frame.
	 * element - {DOMElement} Optional element that visually bounds the animation.
	 */
	var requestFrame = (function() {
		var request = window[requestAnimationFrame] ||
		function(callback, element) {
			window.setTimeout(callback, 16);
		};
		// bind to window to avoid illegal invocation of native function
		return function(callback, element) {
			request.apply(window, [callback, element]);
		};
	})();

	// private variables for animation loops
	var counter = 0;
	var loops = {};

	/**
	 * Function: start
	 * Executes a method with <requestFrame> in series for some
	 *     duration.
	 *
	 * Parameters:
	 * callback - {Function} The function to be called at the next animation frame.
	 * duration - {Number} Optional duration for the loop.  If not provided, the
	 *     animation loop will execute indefinitely.
	 * element - {DOMElement} Optional element that visually bounds the animation.
	 *
	 * Returns:
	 * {Number} Identifier for the animation loop.  Used to stop animations with
	 *     <stop>.
	 */
	function start(callback, duration, element) {
		duration = duration > 0 ? duration : Number.POSITIVE_INFINITY;
		var id = ++counter;
		var start = +new Date;
		loops[id] = function() {
			if (loops[id] && +new Date - start <= duration) {
				callback();
				if (loops[id]) {
					requestFrame(loops[id], element);
				}
			} else {
				delete loops[id];
			}
		};
		requestFrame(loops[id], element);
		return id;
	}

	/**
	 * Function: stop
	 * Terminates an animation loop started with <start>.
	 *
	 * Parameters:
	 * id - {Number} Identifier returned from <start>.
	 */
	function stop(id) {
		delete loops[id];
	}

	return {
		isNative : isNative,
		requestFrame : requestFrame,
		start : start,
		stop : stop
	};
})