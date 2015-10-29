Niman.plugin('supports', [], function(info) {

	//Array遍历
	Array.prototype.forEach = Array.prototype.forEach ||
	function(fun) {
		for (var i = 0; i < this.length; i++) {
			fun(this[i], i, this);
		}
	};

	//用for(property in object)迭代object属性时，IE不包括 toString属性，判断是否包含toString属性
	function hasToString(obj) {
		var sourceIsEvt = typeof window.Event == "function" && obj instanceof window.Event;
		return !sourceIsEvt && obj.hasOwnProperty && obj.hasOwnProperty("toString");
	}

	var supports = info.supports = {
		hasOrDo : function(name, scope, cbk1, cbk2) {
			if (supports.has(info.config.plugin, name)) {
				info.moduleFactory.getPlugin(name).initState.ok(function() {
					cbk1 && cbk1.apply(scope, arguments);
				});
			} else {
				cbk2 && cbk2.apply(scope, arguments);
			}
		},
		useOrDo : function(name, scope, cbk1, cbk2) {
			if (info.config.location[name]) {
				Niman.Module.use(name, function() {
					cbk1 && cbk1.apply(scope, arguments);
				});
			} else {
				cbk2 && cbk2.apply(scope, arguments);
			}
		},
		//获得Object或Array中对象对应的key或index
		getId : function(obj, value) {
			var id = null;
			supports.forEach(obj, function(k, v) {
				if (v === value) {
					id = k;
				}
				return !(v === value);
			});
			return id;
		},
		//Object或Array中是否包含给定的对象
		has : function(obj, value) {
			var id = supports.getId(obj, value);
			return !(id === null);
		},
		//遍历Object或Array
		forEach : function(obj, callback) {
			var type = supports.typeOf(obj);
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
		//类Array转为Array
		toArr : function(_arr) {
			return Array.prototype.slice.call(_arr);
		},
		//混入对象
		mix : function() {
			var objs = supports.toArr(arguments);
			var a = objs.shift();
			supports.forEach(objs, function(i, b) {
				for (var k in b) {
					a[k] = b[k];
				}
				if (hasToString(b)) {
					a.toString = b.toString;
				}
			});
			return a;
		},
		//识别数据类型
		typeOf : function(obj) {
			if ('undefined' === typeof obj) {
				return 'Undefined';
			}
			var a = [window, document, null], b = ['Window', 'Document', 'Null'];
			for (var i = 0; i < 3; i++) {
				if (a[i] === obj) {
					return b[i];
				}
			}
			var type = Object.prototype.toString.call(obj).slice(8, -1);
			if (navigator && navigator.appName == 'Microsoft Internet Explorer' && 'Object' == type && obj) {
				if (obj.nodeName && obj.nodeType == 1) {
					type = 'HTML' + obj.tagName + 'Element';
				}
				if (obj.nodeValue) {
					type = 'Text';
				}
			}
			return type;
		}
	};

});
