(function(_window) {
	
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

	//判断是否是DOM
	var isDom = function(obj) {
		if ((undefined != window['Element'] && obj instanceof window['Element']) || 
		(navigator && new RegExp('msie [67]', 'g').test(navigator.userAgent.toLowerCase()) && 'object' == typeof obj)) {
			return true;
		}
		return false;
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
			callback(brother);
			children = children.concat(toArr(brother.childNodes));
		});
		children.length > 0 && arguments.callee(children, callback);
	};

	//添加移除class
	var className = function(dom, name, add) {
		var clsNames = dom.className = dom.className || ' ';
		clsNames = clsNames.split(' ');
		clsNames.forEach(function(v, i) {
			v == name && (clsNames[i] = '');
		})
		dom.className = clsNames.join(' ');
		if (add) {
			dom.className = (dom.className + ' ' + name).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
		}
	};

	//格式化过滤条件
	var formatFilter = function(_filter) {
		return _filter.replace(/^\w+$/g, 'tagName=' + _filter.toUpperCase()).replace(/^\./, 'className=').replace(/^\#/, 'id=').replace(/\[|\]/g, '').split('=');
	};

	//定义Ndq
	function Ndq(domList) {
		domList = domList || [document];
		domList = ((domList instanceof Array)||(domList instanceof Ndq)) ? domList : [domList];
		this.domList = domList;
		this.length = this.domList.length;
		for (var i = 0; i < this.domList.length; i++) {
			this[i] = this.domList[i];
		}
	};

	Ndq.prototype = {
		_QueryMap: {
			tagName: function(domList, v, tempDomlist) {
				domList.forEach(function(_dom) {
					traversalDomNode(_dom, function(child) {
						var tagName = child.tagName && child.tagName.toUpperCase();
						tagName == v.toUpperCase() && tempDomlist.push(child);
					});
				});
			},
			className: function(domList, v, tempDomlist) {
				domList.forEach(function(_dom) {
					traversalDomNode(_dom, function(child) {
						var classNames = (child.className || '').split(' ');
						for (var i = 0; i < classNames.length; i++) {
							if (classNames[i] == v) {
								tempDomlist.push(child);
								break;
							}
						}
					});
				});
			},
			id: function(domList, v, tempDomlist) {
				domList.forEach(function(_dom) {
					traversalDomNode(_dom, function(child) {
						var id = child.getAttribute && child.getAttribute('id');
						id == v && tempDomlist.push(child);
					});
				});
			}
		},
		_str: function(filter) {
			var returnDomList = [],
				self = this;
			var filters = filter.split(' ');
			var domList = [].concat(this.domList);
			filters.forEach(function(_filter) {
				_filter = formatFilter(_filter);
				var k = _filter[0],
					v = _filter[1],
					l = _filter.length;
				var tempDomlist = [],
					search;
				for (var _k in self._QueryMap) {
					if (new RegExp(_k, 'g').test(k)) {
						search = self._QueryMap[k];
						break;
					}
				}
				//属性查询
				if (!search) {
					search = function(domList, v, tempDomlist) {
						domList.forEach(function(_dom) {
							traversalDomNode(_dom, function(child) {
								if (child.getAttribute) {
									var _v = child.getAttribute(k);
									if ((2 == l && v == _v) || (1 == l && 'null' != typeof _v)) {
										tempDomlist.push(child);
									}
								}
							})
						});
					};
				}
				search(domList, v, tempDomlist);
				domList = tempDomlist;
			});
			return domList;
		},
		_getFilteredDomList: function(filter) {
			if (filter instanceof Ndq) {
				return [].concat(filter.domList);
			}
			if ('string' == typeof filter) {
				return this._str(filter);
			} else if (isDom(filter)) {
				return [filter];
			} else if (filter instanceof Array) {
				return filter;
			} else if ('function' == typeof filter) {
				return this._fun(filter);
			}
			return [];
		},
		_fun: function(fun) {
			var returnDomList = [];
			this.domList.forEach(function(_dom) {
				traversalDomNode(_dom, function(child) {
					if (fun(child)) {
						returnDomList.push(child);
					}
				});
			});
			return returnDomList;
		},
		find: function(filter) {
			return new Ndq(this._getFilteredDomList(filter));
		},
		each: function(callback) {
			for (var i = 0; i < this.length; i++) {
				if (false === callback.apply(this[i], [i, this[i]])) {
					break;
				}
			}
			return this;
		},
		attr: function(k, v) {
			if ('undefined' == typeof v) {
				return this[0].getAttribute && this[0].getAttribute(k);
			}
			this.each(function(i, dom) {
				dom.setAttribute && dom.setAttribute(k, v);
			});
			return this;
		},
		css: function(k, v) {
			if ('undefined' == typeof v) {
				var _v = this[0].style && this[0].style[k];
				_v = _v ? _v : 'auto';
				return _v;
			}
			this.each(function(i, dom) {
				dom.style[k] = v;
			});
			return this;
		},
		addClass: function(name) {
			this.each(function(i, dom) {
				className(dom, name, true);
			});
			return this;
		},
		removeClass: function(name) {
			this.each(function(i, dom) {
				className(dom, name);
			});
			return this;
		},
		hasClass: function(str) {
			var has;
			this.each(function(i, dom) {
				if (new RegExp(str, 'g').test(dom.className)) {
					has = true;
				}
			});
			return has;
		},
		//绑定事件
		bind: function(evt, cbk) {
			this.each(function(i, dom) {
				observeElement(dom, evt, cbk);
			});
			return this;
		},
		//解除绑定
		unbind: function(evt, cbk) {
			this.each(function(i, dom) {
				stopObserveElement(dom, evt, cbk);				
			});
			return this;
		},
		value: function(value) {
			this.attr('value', value);
			return this;
		},
		show: function(value) {
			this.css('display', '');
			return this;
		},
		hide: function(value) {
			this.css('display', 'none');
			return this;
		},
		toggle: function() {
			this.each(function(i, dom) {
				dom.style.display = dom.style.display == 'none' ? '' : 'none'
			});
			return this;
		}
	};

	Ndq.$ = function(filter) {
		if (isDom(filter) || document == filter) {
			return new Ndq(filter);
		}
		return new Ndq().find(filter);
	};
	
	//-----------------------------------------模块-----------------------------------------//

	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		//node.js
		module.exports = Ndq;
	} else if (typeof define === 'function') {
		//CommonJS
		define(function(require, exports, module) {
			module.exports = Ndq;
		});
	} else if (_window['Niman'] && 'function' == typeof _window['Niman'].define) {
		//Niman
		Niman.define('ndq', [], function(context) {
			context.ndq = Ndq;
		});
	} else {
		//window
		_window.NimanDomQuery = Ndq;
	}
	
})(this)
