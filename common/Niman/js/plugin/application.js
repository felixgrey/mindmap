Niman.plugin('application', ['supports'], function(info) {

	var main = info.currentScript.getAttribute('data-main') || info.config.main;
	var moduleFactory = info.moduleFactory;

	//插件
	var plugins = info.config.plugin,
		pluginAllOkArr = [];
	for (var i = 0; i < plugins.length; i++) {
		pluginAllOkArr.push(moduleFactory.getPlugin(plugins[i]).initState);
	}

	var readyState = new info.StateAction();
	info.readyState = readyState;

	function ready(fn) {
		var isIE = /msie/g.test(navigator.userAgent.toLowerCase());
		if (!isIE && document.addEventListener) {
			document.addEventListener("DOMContentLoaded", function() {
				document.removeEventListener("DOMContentLoaded", fn, false);
			}, false);
		} else {
			if (document.documentElement.doScroll && window == window.top)(function() {
				try {
					document.documentElement.doScroll("left");
					fn();
				} catch (error) {
					setTimeout(arguments.callee, 0);
					return;
				}
			})();
		}
	};

	function setOk() {
		readyState.setOk();
	};

	info.windowLoadState.ok(setOk);
	ready(setOk);

	//预加载模块
	var preloadAllOkArr = [readyState];
	var preloads = info.config.preload || (info.config.preload = []);
	var preloadFun = function() {
		for (var i = 0; i < preloads.length; i++) {
			var _name = preloads[i];
			var _preload = moduleFactory.getModule(_name);
			preloadAllOkArr.push(_preload.readyState);
			info.moduleLoader.load(_name);
		}
		main && info.moduleLoader.load(main);
	};
	info.supports.hasOrDo('definition', this, preloadFun, preloadFun);

	//预加载模块在页面加载后初始化
	var pluginAllOk = new info.StateAction(),
		preloadAllOk = new info.StateAction();
	pluginAllOk.all(pluginAllOkArr).ok(function() {
		for (var i = 0; i < preloads.length; i++) {
			var _name = preloads[i];
			var _preload = moduleFactory.getModule(_name);
			preloadAllOkArr.push(_preload.initState);
			Niman.use(_name);
		}
		preloadAllOk.all(preloadAllOkArr).ok(function() {
			main && Niman.use(main);
		});
	});


});