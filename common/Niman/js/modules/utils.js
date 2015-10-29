(function(_window) {

	//用for(property in object)迭代object属性时，IE不包括 toString属性，判断是否包含toString属性
	var hasToString = function(obj) {
		var sourceIsEvt = typeof _window.Event == "function" && obj instanceof _window.Event;
		return !sourceIsEvt && obj.hasOwnProperty && obj.hasOwnProperty("toString");
	};

	var hasCloned = function(track, v) {
		for (var i = 0; i < track.length; i++) {
			if (v === track[i].src) {
				return track[i].clone;
			}
		}
		return null;
	};

	var ten = function(k) {
		return k < 10 ? '0' + k : '' + k;
	};

	var utils = {
		//深克隆
		clone: function(obj, _track) {
			var track = _track || [];
			var cloneObj, _type = utils.typeOf;
			if ('Object' == _type(obj)) {
				cloneObj = {};
			} else if ('Array' == _type(obj)) {
				cloneObj = [];
			} else {
				return obj;
			}
			track.push({
				src: obj,
				clone: cloneObj
			});
			var clone = arguments.callee;
			utils.forEach(obj, function(k, v) {
				if (cloneObj[k] = hasCloned(track, v)) {
					return false;
				} else {
					cloneObj[k] = clone(v, track);
				}
			});
			return cloneObj;
		},
		//获得Object或Array中对象对应的key或index
		getId: function(obj, value) {
			var id = null;
			utils.forEach(obj, function(k, v) {
				if (v === value) {
					id = k;
				}
				return !(v === value);
			});
			return id;
		},
		//遍历Object或Array
		forEach: function(obj, callback) {
			var type = utils.typeOf(obj);
			if ('Array' == type) {
				for (var i = 0; i < obj.length; i++) {
					if (false === callback(i, obj[i])) {
						break;
					}
				}
			} else if ('Object' == type) {
				if (hasToString(obj) && (false === callback('toString', obj.toString))) {
					return;
				}
				for (var k in obj) {
					if (false === callback(k, obj[k])) {
						break;
					}
				}
			}
		},
		//Object或Array中是否包含给定的对象
		has: function(obj, value) {
			var id = utils.getId(obj, value);
			return !(id === null);
		},
		//移除
		rmByIndex: function(arr, i) {
			arr.splice(i, 1);
		},
		//插入
		insertAt: function(arr, i, o) {
			arr.splice(i, 0, o);
		},
		//从Object或Array中移除对象
		rmObj: function(obj, value) {
			utils.forEach(obj, function(k, v) {
				if (v == value) {
					if ('Array' == utils.typeOf(obj)) {
						utils.rmByIndex(obj, k);
					} else if ('Object' == utils.typeOf(obj)) {
						delete obj[k];
					}
					return false;
				}
			});
		},
		//识别数据类型
		typeOf: function(obj) {
			if (undefined === obj) {
				return 'Undefined';
			}
			var a = [_window, _window.document, null],
				b = ['Window', 'Document', 'Null'];
			for (var i = 0; i < 3; i++) {
				if (a[i] === obj) {
					return b[i];
				}
			}
			var type = Object.prototype.toString.call(obj).slice(8, -1);
			if ((undefined != _window.Element && obj instanceof _window.Element) || (_window.navigator && /msie [67]/g.test(_window.navigator.userAgent.toLowerCase()) && 'Object' == type && obj)) {
				if (obj.nodeName && obj.nodeType == 1) {
					type = 'HTML' + obj.tagName.toUpperCase();
				}
				if (obj.nodeValue) {
					type = 'Text';
				}
			}

			return type;
		},
		//格式化日期
		formatDate: function(date, pattern) {
			var YYYY = date.getFullYear() + '';
			var MM = ten(date.getMonth() + 1);
			var dd = ten(date.getDate());
			var hh = ten(date.getHours());
			var mm = ten(date.getMinutes());
			var ss = ten(date.getSeconds());
			var SS = ten(date.getMilliseconds());
			return pattern.replace(/YYYY/i, YYYY).replace(/YY/i, YYYY.substring(2)).replace(/MM/, MM).replace(/dd/i, dd).replace(/hh/i, hh).replace(/mm/, mm).replace(/ss/, ss).replace(/SS/, SS).replace(/M/, date.getMonth() + 1).replace(/d/i, date.getDate()).replace(/h/i, date.getHours()).replace(/mm/, date.getMinutes()).replace(/s/, date.getSeconds()).replace(/S/, date.getMilliseconds());
		}
	};

	//-----------------------------------------模块-----------------------------------------//

	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		//node.js
		module.exports = utils;
	} else if (typeof define === 'function') {
		//CommonJS
		define(function(require, exports, module) {
			module.exports = utils;
		});
	} else if (_window['Niman'] && 'function' == typeof _window['Niman'].define) {
		//Niman
		Niman.define('utils', [], function(context) {
			context.utils = utils;
		});
	} else {
		//window
		_window.NimanUtils = utils;
	}

})(this);