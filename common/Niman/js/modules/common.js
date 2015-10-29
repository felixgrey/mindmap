(function(_window) {
	//用for(property in object)迭代object属性时，IE不包括 toString属性，判断是否包含toString属性
	var hasToString = function(obj) {
		var sourceIsEvt = typeof _window.Event == "function" && obj instanceof _window.Event;
		return !sourceIsEvt && obj.hasOwnProperty && obj.hasOwnProperty("toString");
	};

	!String.prototype.trim && (String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	});

	//Array遍历
	Array.prototype.forEach = Array.prototype.forEach ||
		function(fun) {
			for (var i = 0; i < this.length; i++) {
				var re = fun(this[i], i, this);
				if (false == re) {
					break;
				}
			}
		};

	//继承
	Function.prototype.extendFrom = function(fun) {
		var _t = function() {};
		_t.prototype = fun.prototype;
		this.prototype = new _t;
		return this;
	};

	var common = {
		//浏览器
		BROWSER_NAME: (function() {
			var name = "";
			var ua = '';
			if (undefined !== _window['navigator']) {
				ua = _window['navigator'].userAgent.toLowerCase();
			}
			if (ua.indexOf("opera") != -1) {
				name = "opera";
			} else if (ua.indexOf("msie") != -1) {
				name = "msie";
			} else if (ua.indexOf("safari") != -1) {
				name = "safari";
			} else if (ua.indexOf("mozilla") != -1) {
				if (ua.indexOf("firefox") != -1) {
					name = "firefox";
				} else {
					name = "mozilla";
				}
			}
			return name;
		})(),
		//类Array转为Array;旧IE Array.prototype.slice.call(arguments)失效
		toArr: function(_arr) {
			var re = [];
			for (var i = 0; i < _arr.length; i++) {
				re.push(_arr[i]);
			}
			return re;
		},
		//UUID
		createId: function(prefix) {
			prefix = prefix || '';
			//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/873856#873856
			var s = [],
				hexDigits = "0123456789ABCDEF";
			for (var i = 0; i < 32; i += 1) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			return prefix + s.join("");
		},
		//混入对象
		mix: function() {
			var objs = common.toArr(arguments);
			var a = objs.shift();
			objs.forEach(function(b) {
				for (var k in b) {
					a[k] = b[k];
				}
				if (hasToString(b)) {
					a.toString = b.toString;
				}
			});
			return a;
		}
	};

	function StateAction(scope) {
		this.scope = scope;
		this.status = 0;
		this._thenFuns = [];
		this._args = [];
	};

	common.StateAction = StateAction;

	common.mix(StateAction.prototype, {
		ok: function(fun) {
			if (1 == this.status) {
				fun.apply(this.scope, this._args);
			} else {
				this._thenFuns.push(fun);
			}
			return this;
		},
		all: function(list) {
			var ok = 0,
				allOk = list.length,
				self = this;
			ok == allOk && (self.setOk(list));
			for (var i = 0; i < allOk; i++) {
				list[i].ok(function() {
					ok++;
					ok == allOk && (self.setOk(list))
				});
			}
			return this;
		},
		setOk: function() {
			if (1 != this.status) {
				this.status = 1;
				this._args = Array.prototype.slice.call(arguments);
				var fun;
				while (fun = this._thenFuns.shift()) {
					fun.apply(this.scope, this._args);
				}
			}
			return this;
		}
	});

	function Emitter() {
		this.emitterMap = {};
	};

	common.Emitter = Emitter;

	common.mix(Emitter.prototype, {
		_get: function(evtName) {
			return this.emitterMap[evtName] = this.emitterMap[evtName] || [];
		},
		destroy: function() {
			this.emitterMap = null;
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
			var args = common.toArr(arguments),
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
			return this;
		}
	});


	//-----------------------------------------模块-----------------------------------------//

	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		//node.js
		module.exports = common;
	} else if (typeof define === 'function') {
		//CommonJS
		define(function(require, exports, module) {
			module.exports = common;
		});
	} else if (_window['Niman'] && 'function' == typeof _window['Niman'].define) {
		//Niman
		Niman.define('common', [], function(context) {
			context.common = common;
		});
	} else {
		//window
		window.NimanCommon = common;
	}

})(this);