Niman.plugin('definition', ['supports'], function(info) {

	//配置信息
	var config = info.config, Module = Niman.Module, factory = info.moduleFactory, supports = info.supports, typeOf = supports.typeOf;

	//当前模块
	var currentModuleInfo = [];

	//转化为符合AMD规范的定义格式
	var buildAmdCallback = function(name, dependencies, fun) {
		return function(ctx) {
			var arg = [];
			supports.forEach(dependencies, function(i, _name) {
				arg.push(ctx[_name]);
			});
			ctx[name] = fun.apply(null, arg);
		};
	};

	//数据模块
	var buildDataCallback = function(name, dependencies, fun) {
		return function(_ctx) {
			_ctx[name] = fun;
		};
	};

	//CommonJs规范的require方法
	var require = function(name) {
		return info.context[name];
	};

	//转化为符合CommonJs规范的定义格式
	var buildCommonJsCallback = function(name, dependencies, fun) {
		return function(ctx) {
			var module = {
				exports : {}
			};
			var exports = fun.apply(null, [require, module.exports, module]);
			ctx[name] = exports || module.exports;
		};
	};

	//从函数的require代码中提取依赖
	var REQUIRE_REG = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
	var getdependencies = function(callback) {
		var callbackStr = callback.toString();
		var require = [];
		callbackStr.replace(/\\\\/g, "").replace(REQUIRE_REG, function(m, m1, m2) {
			if (m2) {
				require.push(m2)
			}
		});
		return require;
	};

	var buildCallBackMap = {
		'amd' : buildAmdCallback,
		'commonJs' : buildCommonJsCallback,
		'cmd' : buildCommonJsCallback,
		'data' : buildDataCallback
	};

	//异步加载模块后读取模块信息
	info.getPagePolicy['\\.js$'] = function(url, callback) {
		var cbk = function(script, evt) {
			var _c = currentModuleInfo.shift();
			if (_c) {
				var name = _c.name || supports.getId(config.location, script.originSrc)||script.originSrc;
				var type = _c.type, dependencies = _c.dependencies, fun = _c.fun;
				Niman.define(name, dependencies, buildCallBackMap[type](name, dependencies, fun));
			}
			callback && callback(script, evt);
		}
		info.getJs.apply(info, [url, cbk]);
	};

	//CommonJs规范
	var commonJs = function(fun) {
		return {
			type : 'commonJs',
			dependencies : getdependencies(fun),
			fun : fun
		};
	};

	//各种定义规范的格式化
	var definitionFormatter = {
		//匿名CommonJs规范
		FunctionUndefinedUndefined : commonJs,
		//具名CommonJs规范
		StringFunctionUndefined : function(name, fun) {
			var info = commonJs(fun);
			info.name = name;
			return info;
		},
		//匿名AMD规范
		ArrayFunctionUndefined : function(dependencies, fun) {
			return {
				type : 'amd',
				dependencies : dependencies,
				fun : fun
			};
		},
		//数据对象
		ObjectUndefinedUndefined : function(name, dependencies, fun) {//数据对象模块
			return {
				type : 'data',
				dependencies : [],
				fun : name
			};
		},
		//具名AMD规范或CMD规范
		StringArrayFunction : function(name, dependencies, fun) {
			var _dependencies = getdependencies(fun);
			var cmd = false;
			//如果依赖数组和require一致，视为CMD规范
			if (_dependencies.length == dependencies.length) {
				cmd = true;
				for (var i = 0; i < dependencies.length; i++) {
					if (!supports.has(_dependencies, dependencies[i]) || !supports.has(dependencies, _dependencies[i])) {
						cmd = false;
						break;
					}
				}
			}
			var info = {
				name : name,
				dependencies : dependencies
			}
			info.type = cmd ? 'cmd' : 'amd';
			return info;
		}
	};

	//标准定义模块接口
	var define = info.global.define = function(name, dependencies, fun) {
		//根据参数特性判断规范，得到格式化定义信息处理方法
		var infoFormatter = definitionFormatter[typeOf(name) + typeOf(dependencies) + typeOf(fun)];
		var moduleInfo = (infoFormatter && infoFormatter(name, dependencies, fun)) || {};
		if (info.name) {
			//具名模块可以立即解析
			with (moduleInfo) {
				Niman.define(name, dependencies, buildCallBackMap[type](name, dependencies, fun));
			}
		} else {
			//保存格式化后定义信息,在onload阶段解析
			currentModuleInfo.push(moduleInfo);
		}
	};

	info.global.require = function(name) {
		Niman.Module.use(name);
	};

	define.amd = 'amd';
	define.require = info.global.require;

});

