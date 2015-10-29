define(function(require, exports, module) {
	var common = require('common');
	var Nvm = require('nvm');
	var events = require('events');
	var widget = require('widget');
	var najax = require('najax');
	var Promise = require('npromise');
	var ndq = require('ndq');

	function ViewModel(element, options) {
		if (element.viewModelId) {
			throw new Error('ViewModel has created.');
		}
		this.widgets = {};
		this.contextInfo = {};
		options && common.mix(this, options);
		this.init(element);
	};

	var prototype = ViewModel.prototype = {
		stopEvent: true,
		init: function(element) {
			this.nvm = new Nvm(element);
			var self = this;
			this.nvm._deleteNode = function(info, i) {
				var children = info.nodeList[i];
				for (var j = 0; j < children.length; j++) {
					events.destroy(children[j]);
					if (children[j]._widget) {
						children[j]._widget.destroy();
					}
				}
				Nvm.prototype._deleteNode.apply(self.nvm, arguments)
			}
			this.nvm._ignoreDom = function(dom) {
				var data_widget = dom.getAttribute && dom.getAttribute('data-widget');
				if (data_widget && !dom._widget) {
					(require(Nvm.getDataBindMap('data-widget', dom).name))(dom, self);
				}
				return !!dom.privateDom;
			};
			this.events = events.listen(this.nvm.element, this.stopEvent);
		},
		bindModel: function() {
			if (this.nvm.hasBinded) {
				throw new Error('ViewModel has binded.');
			}
			this.nvm.bindModel.apply(this.nvm, arguments);
		},
		replaceList: function(_path, list) {
			_path = Nvm.formatBindPath(_path);
			var key = _path.split('.').pop();
			var __path = _path.replace(new RegExp('\\.' + key + '$', 'g'), '');
			var oldP = this.getValue(__path);
			oldP[key] || (oldP[key] = []);
			var dl = list.length - oldP[key].length;
			if (dl > 0) {
				for (var i = 0; i < dl; i++) {
					this.insertData(_path, {});
				}
			} else {
				for (var j = 0; j < -dl; j++) {
					this.removeData(_path + '.0');
				}
			}
			oldP[key] = list;
			this.refresh();
		},
		setValue: function() {
			this.nvm.setValue.apply(this.nvm, arguments);
			this.emit('$change', arguments[0], arguments[1], arguments[2]);
		},
		destroy: function() {
			this.emit('$destroy');
			Nvm.traversalDomNode(this.nvm.element, function(dom) {
				if (dom._widget) {
					dom._widget.destroy();
				}
			});
			this.nvm.destroy();
			events.destroy(this.nvm.element);
		}
	};

	ViewModel.isSetValue = Nvm.isSetValue;
	ViewModel.getData = Nvm.getData;
	ViewModel.Promise = Promise;
	ViewModel.$ = ndq.$;

	ViewModel.ajax = function(param) {
		return new Promise(function(resolve, reject) {
			var success = param.success;
			param.success = function(data) {
				success && success(data);
				resolve(data);
			}
			najax(param);
		});
	};

	var eventsFunarr = ['on', 'un', 'emit', 'addComplexEvents'];
	for (var i = 0; i < eventsFunarr.length; i++) {
		var name = eventsFunarr[i];
		prototype[name] = (function(_name) {
			return function() {
				return this.events[_name].apply(this.events, arguments);
			}
		})(name);
	}

	var nvmFunArr = ['insertData', 'removeData', 'refresh', 'getValue'];
	for (var i = 0; i < nvmFunArr.length; i++) {
		var name = nvmFunArr[i];
		prototype[name] = (function(_name) {
			return function() {
				return this.nvm[_name].apply(this.nvm, arguments);
			}
		})(name);
	}

	return ViewModel;
});