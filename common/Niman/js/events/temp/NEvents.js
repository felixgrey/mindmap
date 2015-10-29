/**
 * 事件管理器
 */
(function(_window) {

	var eventsMap = {};

	var exports = {};

	exports.POSITION_EVENTS = ['gesturestart', 'gesturechange', 'gestureend', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseover', 'mousemove', 'mouseup', 'click', "dblclick", "contextmenu", 'mousewheel', 'DOMMouseScroll'];

	exports.BROWSER_EVENTS = ['orientationchange', "drop", "dragleave", "dragenter", "dragover", "dragend", "dragstart", "drag", "load", "change", "focus", 'scroll', "blur", "resize", "error", "keypress", "keydown", "keyup"].concat(exports.POSITION_EVENTS);

	//类Array转为Array;旧IE Array.prototype.slice.call(arguments)失效
	function toArr(_arr) {
		var re = [];
		for (var i = 0; i < _arr.length; i++) {
			re.push(_arr[i]);
		}
		return re;
	}

	var idIndex=0;
	
	function Events() {
		this.emitterMap = {};
		this.contextInfo = {};
		this.listenerList = [];
		this.id =idIndex++;
		eventsMap[this.id] = this;
	};

	exports.eventBus = new Events();

	Events.prototype = {
		_get: function(evtName) {
			return this.emitterMap[evtName] = this.emitterMap[evtName] || [];
		},
		destroy: function() {
			this.emitterMap = null;
			var obj;
			while (obj = this.listenerList.shift()) {
				exports.stopObserveElement(this.bindElement, obj.name, obj.fun);
			}
			this.listenerList = null;
			this.bindElement = null;
			delete eventsMap[this.id];
		},
		on: function(evtName, scope, fun, once) {
			var evts = this._get(evtName);
			evts.push({
				evtName: evtName,
				scope: scope,
				fun: fun,
				once: once
			});
			return this;
		},
		un: function(evtName, scope, fun) {
			var evts = this._get(evtName);
			for (var i = 0; i < evts.length; i++) {
				var evt = evts[i];
				if (evt.scope == scope && evt.fun == fun) {
					evts.splice(i, 1);
					return this;
				}
			}
			return this;
		},
		emit: function() {
			var args = toArr(arguments),
				evtName = args.shift(),
				evts = this._get(evtName),
				delArr = [];
			for (var i = 0; i < evts.length; i++) {
				var evt = evts[i];
				evt.fun.apply(evt.scope, args);
				evt.once && delArr.push(evt);
			}
			for (var i = 0; i < delArr.length; i++) {
				var evt = delArr[i]
				this.un(evt.evtName, evt.scope, evt.fun);
			}
			this.eventBus && this.eventBus.emit(evtName, evt);
			return this;
		},
		stopEvent: false,
		cancelDefault: function(evtName) {
			this.bindElement['on' + evtName] = False;
		},
		eventBus: eventBus
	}

	var _type = function(element, type) {
		if (type == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || element.attachEvent)) {
			return 'keydown';
		}
		return type;
	};

	//监听元素
	exports.observeElement = function(element, type, callback, useCapture) {
		useCapture = useCapture || false;
		type = _type(element, type);
		if (element.addEventListener) {
			element.addEventListener(type, callback, useCapture)
		} else {
			element.attachEvent('on' + type, callback);
		}
	};

	//停止监听元素
	exports.stopObserveElement = function(element, type, callback, useCapture) {
		type = _type(element, type);
		element.removeEventListener && element.removeEventListener(type, callback, useCapture);
		element.detachEvent && element.detachEvent('on' + type, callback);
	};

	//停止事件冒泡
	exports.stopEvent = function(event) {
		try {
			event.cancelBubble = true;
			event.stopPropagation && event.stopPropagation();
		} catch (e) {}
	};

	//阻止事件默认行为
	exports.preventDefault = function(evt) {
		evt.preventDefault();
		evt.returnValue = false;
	};

	//寻找元素
	exports.findElement = function(element, callback, top) {
		while (element.parentNode) {
			if (callback(element)) {
				return element;
			}
			if (top == element) {
				return null;
			}
			element = element.parentNode;
		}
		return null;
	};

	//获得事件源
	var getSrcElement = exports.getSrcElement = function(evt) {
		return evt.srcElement || evt.target;
	};

	//位置信息
	var positionInfo = function(evt) {
		evt.xy = {
			x: evt.clientX,
			y: evt.clientY
		};
		evt.wheelStep = evt.wheelDelta ? (evt.wheelDelta / 120) : (-evt.detail / 3);
	};

	//销毁监听器
	exports.destroy = function(element) {
		var event = eventsMap[element.event_id];
		event && event.destroy();
	};

	//绑定
	var bind = function(_name, eventManager) {
		return function(evt) {
			evt = evt || _window.event;
			evt.manager = {
				event: eventManager,
				element: eventManager.bindElement,
				src: getSrcElement(evt)
			};
			eventManager.stopEvent && exports.stopEvent(evt);
			eventManager.emit(_name, evt);
		}
	};

	//监听元素
	exports.listen = function(element, stop) {
		var events = eventsMap[element.event_id],
			be = exports.BROWSER_EVENTS;
		if (!events) {
			events = new Events;
			events.bindElement = element;
			element.event_id = events.id;
			for (var i = 0; i < be.length; i++) {
				var fun = bind(be[i], event);
				events.listenerList.push({
					name: be[i],
					fun: fun
				});
				exports.observeElement(element, be[i], fun);
			}
			for (var i = 0; i < exports.POSITION_EVENTS.length; i++) {
				event.on(exports.POSITION_EVENTS[i], event, positionInfo);
			}
		}
		event.stopEvent = stop;
		return event;
	};

	exports.Events = Events;

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