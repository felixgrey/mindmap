define(function(require, exports, module) {
	var common = require('common');
	var Widget = require('widget');
	var dragger = require('dragger');
	var inertia = require('inertia');
	var mousetouch = require('mousetouch');
	var events = require('events');
	var Nvm = require('nvm');

	function Viewport() {};

	Viewport.extendFrom(Widget);
	common.mix(Viewport.prototype, {
		name: 'Viewport',
		step: 100,
		init: function(dom, wiewModel) {

			dom.style.position = 'absolute';
			dom.style.left = '0px';
			dom.style.top = '0px';
			dom.setAttribute('dragSwitch', 'on');

			var domNode = this.domNode = dom.parentNode;
			domNode !== document.body && !domNode.style.position && (domNode.style.position = 'relative');
			domNode.style.overflow = 'hidden';

			this.options.value && (this.value = this.options.value);
			this.bottom = this.options.bottom || 0;
			this.right = this.options.right || 0;
			this.events = events.listen(domNode);

			var cmp = this.events.complexEvents;
			this.inertia_Dragger = new inertia.Dragger();
			this.events.addComplexEvents(new dragger.Dragger(), this.inertia_Dragger, new mousetouch.Wheel());
			this.events.on('$dragmove', this, this._$dragmove);
			this.events.on('$wheelup', this, this._$wheelup);
			this.events.on('$wheeldown', this, this._$wheeldown);
			if (this.value) {
				wiewModel.on('$viewportposition:' + this.value, this, this._$viewportposition);
			}
		},
		destroy: function() {
			this.wiewModel.un('$viewportposition:' + this.value, this, this._$viewportposition);
			Widget.prototype.destroy.apply(this, arguments);
		},
		_$viewportposition: function(left, top, inertia) {
			!inertia && this.inertia_Dragger.stop();
			top = this._topValue(top);
			left = this._leftValue(left);
			this.dom.style.left = left + 'px';
			this.dom.style.top = top + 'px';
			this.top = top;
			this.left = left;
		},
		_topValue: function(top) {
			var dom = this.dom,
				domNode = this.domNode,
				bottom = this.bottom;
			(top < 0) && (top + dom.offsetHeight) < domNode.offsetHeight - bottom && (top = domNode.offsetHeight - dom.offsetHeight - bottom);
			(top > 0) && (top = 0);
			return top;
		},
		_leftValue: function(left) {
			var dom = this.dom,
				domNode = this.domNode,
				right = this.right;
			(left < 0) && (left + dom.offsetWidth) < domNode.offsetWidth - right && (left = domNode.offsetWidth - dom.offsetWidth - right);
			(left > 0) && (left = 0);
			return left;
		},
		_wheel: function(k) {
			var top = parseInt(this.dom.style.top.replace('px', '') || 0);
			top = this._topValue(top += k * this.step);
			this.dom.style.top = top + 'px';
		},
		_$wheelup: function(evt) {
			this.events.complexEvents.Inertia_Dragger.stop();
			this._wheel(1);
		},
		_$wheeldown: function(evt) {
			this.events.complexEvents.Inertia_Dragger.stop();
			this._wheel(-1);
		},
		_$dragmove: function(evt) {
			var _ = evt.dragInfo,
				dom = this.dom,
				domNode = this.domNode,
				bottom = this.bottom;
			var left = _.srcXY.x + evt.xy.x - _.mouseXY.x;
			var top = _.srcXY.y + evt.xy.y - _.mouseXY.y;
			this._$viewportposition(left, top, true);
		}
	});

	return function(dom, wiewModel) {
		new Viewport().bind(dom, wiewModel);
	}
});