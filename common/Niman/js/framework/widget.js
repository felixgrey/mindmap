define(function(require, exports, module) {
	var common = require('common');
	var Nvm = require('nvm');

	function Widget() {

	};

	Widget.prototype = {
		bind: function(dom, wiewModel) {
			if (!this.name) {
				throw new Error('Widget must has name.');
			}
			this.dom = dom;
			dom._widget = this;
			this.wiewModel = wiewModel;
			this.options = Nvm.getDataBindMap('data-widget', dom);
			var jsId = this.options.jsId;
			if (jsId) {
				if (wiewModel.widgets[jsId]) {
					throw new Error('jsId:' + jsId + ' has existed.');
				} else {
					wiewModel.widgets[jsId] = this;
				}
			}
			this.init(dom, wiewModel);
			wiewModel.on('$widgets', this, this._info);
			return this;
		},
		_info: function(data) {
			if (data) {
				if (!data[this.name]) {
					data[this.name] = [];
				}
				data[this.name].push(this);
			}
		},
		destroy: function() {
			this.wiewModel.un('$widgets', this, this._info);
			delete this.wiewModel;
			delete this.dom._widget;
			delete this.dom;
		},
		init: function(dom, wiewModel) {}
	}

	return Widget;
});