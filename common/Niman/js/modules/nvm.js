define(function(require, exports, module) {

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

	//类Array转为Array;旧IE Array.prototype.slice.call(arguments)失效
	var toArr = function(_arr) {
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
			var next = callback(brother);
			if (false !== next) {
				children = children.concat(toArr(brother.childNodes));
			}
		});
		children.length > 0 && arguments.callee(children, callback);
	};

	Nvm.groupBind = "each|with";

	var addPathInfo = function(dom, path) {
		traversalDomNode(dom, function(_dom) {
			var data_bind = _dom.getAttribute && _dom.getAttribute('data-bind');
			if (data_bind) {
				if (new RegExp(Nvm.groupBind, "g").test(data_bind)) { // BUG： /each/g 安卓2.x不生成新对象
					var _dataWith = _dom._dataWith || '';
					_dom._dataWith = path + _dataWith;
				} else {
					_dom._dataPath = path;
				}
			}
		});
	};

	//兼容旧IE,解决TABLE相关元素innerHTML只读问题
	var clearChildNodes = function(dom) {
		var type = dom.tagName && dom.tagName.toUpperCase(),
			length;
		switch (type) {
			case 'TABLE':
				length = dom.rows.length;
				for (var i = 0; i < length; i++) {
					dom.deleteRow(0);
				}
				break;
			case 'TBODY':
				length = dom.parentNode.rows.length;
				for (var i = 0; i < length; i++) {
					dom.parentNode.deleteRow(0);
				}
				break;
			case 'TR':
				length = dom.cells.length;
				for (var i = 0; i < length; i++) {
					dom.deleteCell(0);
				}
				break;
			default:
				dom.innerHTML = '';
		}
	};

	//解决Opera下cloneNode的bug
	var cloneNode = function(dom) {
		if ('FORM ' == (dom.tagName && dom.tagName.toUpperCase())) {
			var clone = document.createElement('form');
			clone.innerHTML = dom.innerHTML;
			return clone;
		}
		return dom.cloneNode(true);
	};

	//创建节点
	var createNode = function(path, i, cloneTemplate) {
		var clone = cloneNode(cloneTemplate);
		addPathInfo(clone, path.replace(/\.$/g, '') + '.' + i);
		return toArr(clone.childNodes);
	};

	//节点排序
	var sortNode = function(info) {
		var dom = info.dom,
			nodeList = info.nodeList;
		for (var i = 0; i < nodeList.length; i++) {
			var children = nodeList[i];
			for (var j = 0; j < children.length; j++) {
				traversalDomNode(children[j], function(_node) {
					if ('undefined' !== typeof(_node._dataPath)) {
						_node._dataPath = _node._dataPath.replace(/\.\d+$/g, '.' + i)
					}
				});
				dom.appendChild(children[j]);
			}
		}
	};

	//根据路径得到数据
	var getData = function(data, path, param) {
		path = formatBindPath(path);
		var strs = path.split('.'),
			_d = data,
			param = param || path,
			_pd;
		strs.forEach(function(k) {
			(undefined != _d) && k !== '' && (_pd = _d, _d = _d[k]);
		});
		if ((undefined != _d) && 'function' == typeof _d) {
			var arr = toArr(arguments);
			_d = _d.apply(_pd, arr.slice(2));
		}
		return _d;
	};

	//获得绑定信息
	function getDataBindMap(attr, dom) {
		var data_bind = dom.getAttribute && dom.getAttribute(attr),
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

	Nvm.getDataBindMap = getDataBindMap;

	//绑定事件
	var observeElement = function(element, type, callback, useCapture) {
		useCapture = useCapture || false;
		if (element.addEventListener) {
			element.addEventListener(type, callback, useCapture)
		} else {
			element.attachEvent('on' + type, callback);
		}
	};

	//停止绑定
	var stopObserveElement = function(element, type, callback, useCapture) {
		element.removeEventListener && element.removeEventListener(type, callback, useCapture);
		element.detachEvent && element.detachEvent('on' + type, callback);
	};

	function Nvm(element) {
		if ('string' == typeof element) {
			element = document.getElementById(element);
		}
		this.element = element;
		this.listBindMap = {};
		this.template = cloneNode(element);
		var self = this;
		this._change = function(evt) {
			var src = evt.srcElement || evt.target;
			var key = 'value';
			if ('input' == src.tagName.toLowerCase() && (new RegExp("checkbox|radio", 'gi').test(src.getAttribute('type')))) {
				key = 'checked';
			}
			var value = src[key];
			var bindMap = Nvm.getDataBindMap('data-bind', src);
			if (src._dataPath) {
				var path = Nvm.formatBindPath(bindMap[key] || key);
				path = path.replace(src._dataPath, '');
				self.setValue(src._dataPath, path, value);
			}
		};
	};

	Nvm.getData = getData;

	Nvm.traversalDomNode = traversalDomNode;

	Nvm.isSetValue = true;

	var formatBindPath = function(dataPath, bind) {
		if (!bind) {
			bind = dataPath;
			dataPath = '';
		}
		if (new RegExp('^\\$data\\.', 'g').test(bind)) {
			dataPath = bind.replace(new RegExp('^\\$data', 'g'), '');
		} else {
			dataPath = dataPath + bind;
		}
		if (!new RegExp('^\\.', 'g').test(dataPath)) {
			dataPath = '.' + dataPath;
		}
		return dataPath;
	}

	Nvm.formatBindPath = formatBindPath;

	Nvm.prototype = {
		bindModel: function(data) {
			this.data = data;
			if (this.hasBinded) {
				stopObserveElement(this.element, 'change', this._change);
				var element = cloneNode(this.template);
				this.element.parentNode.replaceChild(element, this.element);
				this.element = element;
			}
			observeElement(this.element, 'change', this._change);
			this.hasBinded = true;
			this._bindData(this.element);
		},
		insertData: function(path, obj, i) {
			var list = getData(this.data, path);
			i = i == undefined ? list.length : i;
			list.splice(i, 0, obj);
			var infos = this.listBindMap[path];
			if (infos) {
				for (var j = 0; j < infos.length; j++) {
					var info = infos[j];
					var children = createNode(path, i, info.cloneTemplate);
					this._bindData(children);
					info.nodeList.splice(i, 0, children);
					sortNode(info);
				}
			}
			return children;
		},
		_deleteNode: function(info, i) {
			if (info) {
				var children = info.nodeList[i],
					first;
				info.nodeList.splice(i, 1);
				while (first = children.shift()) {
					info.dom.removeChild(first);
				}
				sortNode(info);
			}
		},
		removeData: function(path) {
			var i;
			path = path.replace(/\.\d+$/g, function(a, b, c) {
				i = parseInt(a.replace('.', ''));
				return '';
			})
			var list = getData(this.data, path);
			if (list.length > i) {
				list.splice(i, 1);
				var infos = this.listBindMap[path];
				if (infos) {
					for (var j = 0; j < infos.length; j++) {
						this._deleteNode(infos[j], i);
					}
				}
			}
		},
		setValue: function(path, key, value) {
			var _dataPath = formatBindPath(path);
			if (null == key) {
				_dataPath = path.replace(/\.\w+$/g, function(a, b, c) {
					key = a.replace('.', '');
					return '';
				})
			}
			_dataPath = _dataPath + '.' + key;
			_dataPath = _dataPath.replace(/\.\./g, '.');
			key = _dataPath.split('.');
			key = key[key.length - 1];
			_dataPath = _dataPath.replace(new RegExp(key + '$', 'g'), '');
			if ('function' == typeof getData(this.data, _dataPath)[key]) {
				getData(this.data, _dataPath)[key](value, _dataPath, Nvm.isSetValue);
			} else {
				getData(this.data, _dataPath)[key] = value;
			}
			this.refresh();
		},
		refresh: function() {
			var self = this;
			traversalDomNode(this.element, function(dom) {
				if (dom._dataPath) {
					var bindMap = getDataBindMap('data-bind', dom);
					for (var type in bindMap) {
						if (!new RegExp(Nvm.groupBind).test(type)) {
							self['_' + type] && self['_' + type](dom, bindMap[type]);
						}
					}
				}
			});
		},
		getValue: function(path, key) {
			key = (null !== key && undefined !== key) ? '.' + key : '';
			return getData(this.data, path + key);
		},
		_with: function(dom, path) {
			addPathInfo(dom, (dom._with || '') + '.' + path);
		},
		_each: function(dom, path) {
			var _dataWith = (dom._dataWith || '') + '.' + path;
			dom._dataWith = _dataWith;
			var cloneTemplate = cloneNode(dom);
			clearChildNodes(dom);
			var maps = this.listBindMap[_dataWith] || (this.listBindMap[_dataWith] = []);
			var map = {
				dom: dom,
				cloneTemplate: cloneTemplate,
				nodeList: []
			};
			maps.push(map);
			var list = getData(this.data, _dataWith) || [];
			list.forEach(function(v, i) {
				var children = createNode(_dataWith, i, cloneTemplate);
				children.forEach(function(child) {
					dom.appendChild(child);
				});
				map.nodeList.push(children);
			})
		},
		_ignoreDom: function(dom) {},
		_bindData: function(element) {
			var self = this;
			traversalDomNode(element, function(dom) {
				if (self._ignoreDom(dom)) {
					return false;
				}
				var bindMap = getDataBindMap('data-bind', dom);
				for (var type in bindMap) {
					self['_' + type] && self['_' + type](dom, bindMap[type]);
				}
			});
		},
		_textHtmlValue: function(dom, bind, isHtml, isTemplate, isValue) {
			var _dataPath = (dom._dataPath && dom._dataPath + '.' || (dom._dataPath = '.'));
			_dataPath = formatBindPath(_dataPath, bind);
			var obj = getData(this.data, _dataPath, dom, _dataPath);
			obj = obj == undefined ? '' : obj;
			if (isTemplate && 'object' == typeof obj) {
				obj = dom.innerHTML.replace(/\$\{S*(\w|\.)+\}/g, function(m1) {
					var k = m1.replace(/^\$\{S*|\}$/g, '');
					var v = getData(obj, k, dom, _dataPath);
					return v == undefined ? '' : v;
				});
			}

			if (isHtml) {
				dom.innerHTML = obj;
			} else if (isValue) {
				dom.value = obj;
			} else {
				dom.innerText = obj;
				dom.textContent = obj;
			}
		},
		_attrStyle: function(dom, bind, isStyle) {
			var attrs = bind.replace(/\{|\}/g, '').split(',');
			var _dataPath = (dom._dataPath && dom._dataPath + '.' || (dom._dataPath = '.'));
			var self = this;
			attrs.forEach(function(attr) {
				var kv = attr.split(':');
				var __dataPath = formatBindPath(_dataPath, kv[1]);
				var v = getData(self.data, __dataPath, dom, _dataPath);
				v != undefined && !isStyle && dom.setAttribute(kv[0], v);
				v != undefined && isStyle && (dom.style[kv[0]] = v);
			})
		},
		_textTemplate: function(dom, bind) {
			this._textHtmlValue(dom, bind, false, true);
		},
		_htmlTemplate: function(dom, bind) {
			this._textHtmlValue(dom, bind, true, true);
		},
		_text: function(dom, bind) {
			this._textHtmlValue(dom, bind);
		},
		_html: function(dom, bind) {
			this._textHtmlValue(dom, bind, true);
		},
		_value: function(dom, bind) {
			this._textHtmlValue(dom, bind, false, false, true);
		},
		_checked: function(dom, bind) {
			var _dataPath = (dom._dataPath && dom._dataPath + '.' || (dom._dataPath = '.'));
			_dataPath = formatBindPath(_dataPath, bind);
			var obj = getData(this.data, _dataPath, dom, _dataPath);
			obj = obj == undefined ? false : obj;
			dom.checked = obj;
		},
		_attr: function(dom, bind) {
			this._attrStyle(dom, bind);
		},
		_style: function(dom, bind) {
			this._attrStyle(dom, bind, true);
		},
		destroy: function() {
			stopObserveElement(this.element, 'change', this._change);
			delete this.element;
			delete this.template;
		}
	};

	module.exports = Nvm;
});