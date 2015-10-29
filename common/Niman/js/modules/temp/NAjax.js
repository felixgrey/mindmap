(function(_wondow){
	
	
	//-----------------------------------------模块-----------------------------------------//

	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		//node.js
		module.exports = exports;
	} else if (typeof define === 'function') {
		//CommonJS
		define(function(require, exports, module) {
			module.exports = exports;
		});
	} else if (_window['Niman'] && 'function' == typeof _window['Niman'].define) {
		//Niman
		Niman.define('events', [], function(context) {
			context.events = exports;
		});
	} else {
		//window
		_window.NimanEvents = exports;
	}
})(this);