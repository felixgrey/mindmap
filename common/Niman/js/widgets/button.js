define(function(require, exports, module) {
	var Widget = require('widget');
	var common = require('common');
	var events = require('events');
	var mousetouch = require('mousetouch');
	var Nvm = require('nvm');
	var $ = require('ndq').$;

	function Button() {};

	Button.extendFrom(Widget);

	common.mix(Button.prototype, {
		name: 'Button',
		init: function(dom, wiewModel) {
			this.value = this.options.value;
			this.pushStyle = this.options.pushStyle;
			if (undefined == this.value) {
				throw new Error('button must has value');
			}
			this.events = events.listen(dom);
			var start = 'true' == this.options.start ? true : false;
			this.events.addComplexEvents(new mousetouch.Click({
				clickIntouchStart: start
			}));
			this.setClickAble(true);
			wiewModel.on('$clickable:' + this.value, this, this.setClickAble);
		},
		_$down: function(evt) {
			evt.buttonObj = this;
			if (this.pushStyle) {
				$(evt.manager.element).addClass(this.pushStyle);
			}
			this.wiewModel.events.emit('$buttondown:' + this.value, evt);
		},
		_$up: function(evt) {
			evt.buttonObj = this;
			if (this.pushStyle) {
				$(evt.manager.element).removeClass(this.pushStyle);
			}
			this.wiewModel.events.emit('$buttonup:' + this.value, evt);
		},
		_$qlclick: function(evt) {
			evt.buttonObj = this;
			this.wiewModel.events.emit('$buttonclick:' + this.value, evt);
		},
		setClickAble: function(able) {
			var name = able ? 'on' : 'un';
			if (name == 'on' && this.clickAble == name) {
				return;
			}
			this.clickAble = name;
			this.events[name]('$down', this, this._$down);
			this.events[name]('$up', this, this._$up);
			this.events[name]('$qlclick', this, this._$qlclick);
		},
		destroy: function() {
			this.wiewModel.un('$clickable:' + this.value, this, this.setClickAble);
			Widget.prototype.destroy.apply(this, arguments);
		}
	});

	return function(dom, wiewModel) {
		new Button().bind(dom, wiewModel);
	};
});