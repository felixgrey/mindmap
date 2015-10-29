(function(ctx, name) {

	var Niman = ctx[name] = {};

	var mix = function(a, b) {
		for (var k in b) {
			a[k] = b[k];
		}
		return a;
	};

	var StateAction = function(scope) {
		this.scope = scope;
		this.status = 0;
		this._thenFuns = [];
		this._args = [];
	};

	mix(StateAction.prototype, {
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

	//获得当前script节点
	var head = document.getElementsByTagName('head')[0] || document.documentElement;
	var scripts = head.getElementsByTagName('script');
	var currentScript = scripts[scripts.length - 1];

	//模块
	var Module = function(name) {
		this.get = 'getModule';
		this.name = name;
		this.readyState = new StateAction(this);
		this.initState = new StateAction(this);
	};

	mix(Module.prototype, {
		init: function() {
			this.readyState.ok(function() {
				if (!this.initState.status) {
					this.fun(ModuleInfo.context);
					this.initState.setOk();
				}
			});
		},
		use: function(cbk) {
			this.initState.ok(function() {
				cbk && cbk();
			});
			if (!this.initState.status) {
				this.readyState.ok(function() {
					var stack = moduleFactory.initStack(this.name),
						_m;
					while (_m = stack.pop()) {
						_m.init();
					}
				});
			}
			moduleLoader.load(this.name);
		},
		define: function(dependencies, fun) {
			this.dependencies = dependencies;
			this.fun = fun;
			var length = dependencies.length;
			var depArr = [];
			for (var i = 0; i < length; i++) {
				var mName = dependencies[i];
				moduleLoader.load(mName);
				depArr.push(moduleFactory[this.get](mName).readyState);
			}
			this.readyState.all(depArr);
		}
	});

	//插件
	var Plugin = function() {
		Module.apply(this, arguments);
		this.get = 'getPlugin';
		this.stop = false;
	};

	mix(Plugin.prototype, Module.prototype);
	Plugin.prototype.init = function() {
		if (!this.initState.status) {
			this.fun(ModuleInfo);
			!this.stop && this.initState.setOk();
		}
	};

	var page = {
		'./': 1
	};

	var getJs = function(url, callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.originSrc = url;
		var cbk = function(evt) {
			callback && callback(script, evt);
			script.parentNode.removeChild(script);
		}
		if (ModuleInfo.isOldIE) {
			script.onreadystatechange = function() {
				if (script.readyState == 'loaded' || script.readyState == 'complete') {
					script.onreadystatechang = null;
					cbk(window.event);
				}
			};
		} else {
			script.onload = cbk;
		}
		script.src = url;
		head.insertBefore(script, scripts[0]);
	};

	var moduleLoader = {
		getPage: function(url, callback) {
			var p = ModuleInfo.getPagePolicy,
				k;
			for (k in p) {
				if (new RegExp(k, 'g').test(url)) {
					p[k](url, callback);
					return;
				}
			}
			getJs(url, callback);
		},
		load: function(name, cbk) {
			var url = ModuleInfo.config.location[name] || name;
			if (url == name && !new RegExp('\\.\\w+$').test(url)) {
				url += '.js';
			}
			if (!page[url]) {
				page[url] = 1;
				this.getPage(url, function(script, evt) {
					cbk && cbk(url);
				});
			} else {
				cbk && cbk(url);
			}
		}
	};

	var moduleMap = {};
	var moduleFactory = {
		getModule: function(name) {
			return moduleMap[name] = moduleMap[name] || new Module(name);
		},
		getPlugin: function(name) {
			return moduleMap[name] = moduleMap[name] || new Plugin(name);
		},
		initStack: function(name, _track, _stack) {
			var track = _track || {};
			var stack = _stack || [];
			var root = moduleMap[name];
			//节点不存在或出现循环依赖，终止执行
			if (!root || track[name]) {
				return;
			}
			track[name] = 1;
			//压栈
			stack.push(root);
			//依赖
			var _f = arguments.callee,
				dependencies = root.dependencies;
			//依赖递归
			for (var i = 0; i < dependencies.length; i++) {
				_f(dependencies[i], mix({}, track), stack);
			}
			return stack;
		}
	};

	var ModuleInfo = {
		config: {
			plugin: [],
			location: {}
		},
		getPagePolicy: {},
		StateAction: StateAction,
		windowLoadState: new StateAction,
		isOldIE: /msie [678]/g.test(navigator.userAgent.toLowerCase()),
		global: ctx,
		context: {},
		getJs: getJs,
		moduleFactory: moduleFactory,
		moduleLoader: moduleLoader,
		head: head,
		currentScript: currentScript
	};

	var onload = function() {
		ModuleInfo.windowLoadState.setOk();
	};
	(window.addEventListener && window.addEventListener('load', onload)) || (window.attachEvent && window.attachEvent('onload', onload));

	var allPluginInitState = new StateAction;

	Niman.define = function(name, dependencies, fun) {
		allPluginInitState.ok(function() {
			moduleFactory.getModule(name).define(dependencies, fun);
		});
	};

	Niman.plugin = function(name, dependencies, fun) {
		moduleFactory.getPlugin(name).define(dependencies, fun);
	};

	Niman.use = function(name, cbk) {
		moduleFactory.getModule(name).use(cbk);
	};

	Niman.config = function(obj) {
		obj = obj || {};
		obj.plugin = obj.plugin || [];
		obj.location = obj.location || {};
		obj = mix(ModuleInfo.config, obj);
		var arr = [];
		for (var i = 0; i < obj.plugin.length; i++) {
			var pg = moduleFactory.getPlugin(obj.plugin[i]);
			arr.push(pg.initState);
			pg.use();
		}
		allPluginInitState.all(arr);
	};

	var cfg = currentScript.getAttribute('data-config');
	cfg && moduleLoader.load(cfg);

})(this, 'Niman');