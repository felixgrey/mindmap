Niman.plugin('framework', ['supports', 'application'], function(info) {


	function toArr(_arr) {
		var re = [];
		for (var i = 0; i < _arr.length; i++) {
			re.push(_arr[i]);
		}
		return re;
	};

	//遍历DOM
	var traversalDomNode = function(doms, callback) {
		doms = doms instanceof Array ? doms : [doms];
		var children = [];
		doms.forEach(function(brother) {
			callback(brother);
			children = children.concat(toArr(brother.childNodes));
		});
		children.length > 0 && arguments.callee(children, callback);
	};

	//获得绑定的控件信息
	function getDataBindMap(dom) {
		var data_bind = dom.getAttribute && dom.getAttribute('data-widget'),
			bindMap = {};
		if (data_bind) {
			var data_binds = data_bind.split(';');
			data_binds.forEach(function(bindInfo) {
				var _obj = {},
					type = bindInfo.split(':')[0];
				bindMap[type] = bindInfo.replace(type + ':', '')
			});
		} else {
			return null;
		}
		return bindMap;
	};

	//加载控件后执行main模块
	var main = info.currentScript.getAttribute('data-main') || info.config.main;
	var moduleFactory = info.moduleFactory;
	var widgetsOk = new info.StateAction();
	var self = this;
	var _use = Niman.use;

	Niman.use = function(name, cbk) {
		if (main && name == main) {
			widgetsOk.ok(
				(function(_name, _cbk) {
					return function() {
						_use.apply(Niman, [_name, _cbk]);
					};
				})(name, cbk)
			);
		} else {
			_use.apply(Niman, arguments);
		}
	};

	info.readyState.ok(function() {
		var widgets = {},
			widgetsList = [];
		traversalDomNode(document, function(dom) {
			var widgetInfo = getDataBindMap(dom);
			if (widgetInfo) {
				widgets[widgetInfo.name] = 1;
			}
		});
		for (var k in widgets) {
			var _widget = moduleFactory.getModule(k);
			widgetsList.push(_widget.initState);
			Niman.use(k);
		}
		widgetsOk.all(widgetsList);
	});

});