define(function(require, exports, module) {
	var common = require('common');

	exports.POSITION_EVENTS = ['gesturestart', 'gesturechange', 'gestureend', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseover', 'mousemove', 'mouseup', 'click', "dblclick", "contextmenu", 'mousewheel', 'DOMMouseScroll'];

	exports.BROWSER_EVENTS = ['orientationchange', "drop", "dragleave", "dragenter", "dragover", "dragend", "dragstart", "drag", "load", "change", "focus", 'scroll', "blur", "resize", "error", "keypress", "keydown", "keyup"].concat(exports.POSITION_EVENTS);

	function False(evt) {
		exports.preventDefault(evt);
		return false;
	};

	var eventsMap = {};
	var Emitter = common.Emitter;

	function Event() {
		Emitter.apply(this, arguments);
		this.id = common.createId('event_');
		eventsMap[this.id] = this;
		this.complexEvents = {};
		this.contextInfo = {};
	};

	exports.eventBus = new Emitter();

	common.mix(Event.prototype, Emitter.prototype, {
		stopEvent : false,
		cancelDefault : function(evtName) {
			this.bindElement['on' + evtName] = False;
		},
		emit : function(evtName, evt) {
			Emitter.prototype.emit.apply(this, arguments);
			this.eventBus && this.eventBus.emit(evtName, evt);
		},
		eventBus : exports.eventBus,
		addComplexEvents : function() {
			for (var i = 0; i < arguments.length; i++) {
				var _c = arguments[i];
				_c.setCore(this);
				if (!_c.name) {
					throw new Error('ComplexEvent must has name.');
				} else if (this.complexEvents[_c.name]) {
					throw new Error('ComplexEvent ' + _c.name + ' has added.');
				}
				this.complexEvents[_c.name] = _c;
			}
			return this;
		}
	});

	function ComplexEvent() {
	};

	ComplexEvent.prototype = {
		setCore : function(events) {
			this.core = events;
			this.init();
		},
		destroy : function() {
			this.core = null;
		},
		init : function() {

		}
	}

	exports.ComplexEvent = ComplexEvent;

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
		} catch(e) {
		}
	};

	//阻止事件默认行为
	exports.preventDefault = function(evt) {
		evt.preventDefault();
		evt.returnValue = false;
	}
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
	var getSrcElement=exports.getSrcElement = function(evt) {
		return evt.srcElement || evt.target;
	};

	var positionInfo = function(evt) {
		evt.xy = {
			x : evt.clientX,
			y : evt.clientY
		};
		evt.wheelStep = evt.wheelDelta ? (evt.wheelDelta / 120) : (-evt.detail / 3);
	};

	exports.positionInfo = positionInfo;

	exports.destroy = function(element) {
		var event = eventsMap[element.event_id];
		event && event.destroy();
	};

	var bind = function(_name, eventManager) {
		return function(evt) {
			evt = evt || window.event;
			evt.manager = {
				event : eventManager,
				element : eventManager.bindElement,
				src:getSrcElement(evt)
			};
			eventManager.stopEvent && exports.stopEvent(evt);
			eventManager.emit(_name, evt);
		}
	};

	exports.listen = function(element, stop) {
		var event = eventsMap[element.event_id], be = exports.BROWSER_EVENTS;
		if (!event) {
			event = new Event;
			event.bindElement = element;
			var destroy = event.destroy;
			event.destroy = function() {
				destroy.apply(this, arguments);
				var obj;
				while ( obj = this.listenerList.shift()) {
					exports.stopObserveElement(this.bindElement, obj.name, obj.fun);
				}
				for (var k in this.complexEvents) {
					this.complexEvents[k].destroy();
					delete this.complexEvents[k];
				}
				this.complexEvents = null;
				this.listenerList = null;
				this.bindElement = null;
				delete eventsMap[this.id];
			};
			element.event_id = event.id;
			event.listenerList = [];
			for (var i = 0; i < be.length; i++) {
				var fun = bind(be[i], event);
				event.listenerList.push({
					name : be[i],
					fun : fun
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

	exports.Event = Event;
});
