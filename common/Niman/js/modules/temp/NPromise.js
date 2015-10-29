(function(_window) {

	function toArr(obj) {
		var arr = [];
		for (var i = 0; i < obj.length; i++) {
			arr.push(obj[i]);
		}
		return arr;
	};

	function PromiseCore() {
		this.state = 'unfulfilled';
		this.thenList = [];
		this.params = [];
	};

	PromiseCore.prototype = {
		_complete: function() {
			var self = this;
			setTimeout(function() {
				var _o, state = self.state;
				while (_o = self.thenList.shift()) {
					var re, err = null,
						isPromise = false,
						next = _o.nextPromise;
					if (_o[state]) {
						try {
							re = _o[state].apply(null, self.params);
						} catch (e) {
							err = e;
						}
						if (isPromise = (re && 'function' == typeof re.then)) {
							(function(_o) {
								re.then(function(p) {
									next._resolve(p);
								}, function(p) {
									next._reject(p);
								});
							})(_o);
						}
						if (err) {
							next._reject(err);
						} else if (!isPromise) {
							next._resolve(re);
						}
					} else {
						next['resolved' == state ? '_resolve' : '_reject'].apply(next, self.params);
					}
				}
			}, 0);
		},
		_then: function(fun1, fun2) {
			var nextPromise = new PromiseCore();
			this.thenList.push({
				resolved: fun1,
				rejected: fun2,
				nextPromise: nextPromise
			});
			'unfulfilled' != this.state && this._complete();
			return nextPromise;
		},
		_change: function(type, params) {
			if (this.state !== 'unfulfilled') {
				return;
			}
			this.state = type;
			this.params = params;
			this._complete();
		},
		_resolve: function(params) {
			this._change('resolved', toArr(arguments));
			return this;
		},
		_reject: function() {
			this._change('rejected', toArr(arguments));
			return this;
		}
	};

	function Promise(fun) {
		var core;
		if (fun instanceof PromiseCore) {
			core = fun;
		} else if (fun instanceof Function) {
			core = new PromiseCore();
			fun(function(param) {
				core._resolve(param);
			}, function(param) {
				core._reject(param);
			});
		} else {
			throw new Error('Promise constructor takes a function argument');
		}
		this.then = function(fun1, fun2) {
			var _next = core._then(fun1, fun2);
			var next = new Promise(_next);
			return next;
		}
		this['catch'] = function(fun2) {
			return this.then(null, fun2);
		}
	};

	Promise.all = function(list) {
		var core = new PromiseCore();
		var ok = 0,
			allOk = list.length,
			_promise = new Promise(core),
			reList = [],
			anyReject = false;
		if (!list || list.length == 0) {
			core._resolve();
		}
		for (var i = 0; i < list.length; i++) {
			var prms = list[i];
			(function(i) {
				prms.then(function(p) {
					ok++;
					reList[i] = p;
					if (ok == allOk) {
						core._resolve(reList)
					}
				}, function(p) {
					core._reject(p);
				});
			})(i);
		};
		return _promise;
	};

	Promise.resolve = function(p) {
		var core = new PromiseCore();
		var _promise = new Promise(core);
		if (p && 'function' == typeof p.then) {
			p.then(function(p) {
				core._resolve(p);
			}, function(p) {
				core._reject(p);
			});
		} else {
			core._resolve(p);
		}
		return _promise;
	};

	Promise.reject = function(p) {
		var core = new PromiseCore();
		var _promise = new Promise(core);
		if (p && 'function' == typeof p.then) {
			p.then(function(p) {
				core._resolve(p);
			}, function() {
				core._reject(p);
			});
		} else {
			core._reject(p);
		}
		return _promise;
	};

	Promise.cast = function(p) {
		if (p && 'function' == typeof p.then) {
			return p;
		};
		var core = new PromiseCore();
		var _promise = new Promise(core);
		core._resolve(p);
		return new Promise(core);
	};

	Promise.race = function(list) {
		var core = new PromiseCore();
		var _promise = new Promise(core);
		var anyChange = false;
		for (var i = 0; i < list.length; i++) {
			list[i].then(function(p) {
				(!anyChange) && core._resolve(p);
				anyChange = true;
			}, function(p) {
				(!anyChange) && core._reject(p);
				anyChange = true;
			});
		}
		return _promise;
	};

	//-----------------------------------------模块-----------------------------------------//

	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		//node.js
		module.exports = Promise;
	} else if (typeof define === 'function') {
		//CommonJS
		define(function(require, exports, module) {
			module.exports = Promise;
		});
	} else if (_window['Niman'] && 'function' == typeof _window['Niman'].define) {
		//Niman
		Niman.define('NPromise', [], function(context) {
			context.NPromise = Promise;
		});
	} else {
		//window
		_window.NimanPromise = Promise;
	}

})(this);