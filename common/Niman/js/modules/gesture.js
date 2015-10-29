define(function(require, exports, module) {
	var common = require('common');
	var common = require('common');
	var utils = require('utils');
	var events = require('events');
	var nanimation = require('nanimation');
	var mousetouch = require('mousetouch');
	var dragger = require('dragger');

	function Gesture(options) {
		options && common.mix(this, options);
	};

	Gesture.extendFrom(events.ComplexEvent);

	exports.Gesture = Gesture;

	common.mix(Gesture.prototype, {
		name: 'Gesture',
		delay: 1000,
		nbPoints: 1000,
		swipe_width: 30,
		swipe_height: 20,
		swipe_time: 1000,
		longTouch: 1000,
		init: function() {
			if (!this.core.complexEvents.Dragger) {
				this.core.addComplexEvents(new dragger.Dragger());
			}
			if (!this.core.complexEvents.Click) {
				this.core.addComplexEvents(new mousetouch.Click());
			}
			this.core.on('$dragstart', this, this._$dragstart);
			this.core.on('$dragmove', this, this._$dragmove);
			this.core.on('$dragend', this, this._$dragend);
			this.core.on('$down', this, this._$down);
			this.core.on('mouseup', this, this._$up);
			this.core.on('touchend', this, this._$up);

		},
		_$up: function() {
			clearTimeout(this.timeout);
		},
		_$down: function(evt) {
			var self = this;
			this.downEvt = utils.clone(evt);
			this.timeout = setTimeout(function() {
				self.core.emit('mouseup', self.downEvt);
				self.core.emit('$longtouch', self.downEvt);
			}, this.longTouch);
		},
		_$dragstart: function() {
			this.points = [];
			this.core.contextInfo.$swipe = false;
		},
		_$dragmove: function(evt) {
			if (!this.core.complexEvents.Click._isClick(evt)) {
				clearTimeout(this.timeout);
			}
			var tts = evt.targetTouches;
			var time = new Date().getTime();
			var info = {
				xy: {
					x: evt.xy.x,
					y: evt.xy.y
				},
				tick: time
			};
			if (tts) {
				info.isTouch = true;
				info.xys = {};
				for (var i = 0; i < tts.length; i++) {
					var src = this.getDragElement(tts[i].target);
					info.xys[tts[i].identifier] = {
						src: src,
						x: tts[i].clientX,
						y: tts[i].clientY
					};
				}

			}
			this.points.unshift(info);
			if (this.points.length > this.nbPoints) {
				this.points.pop();
			}
			this._swipe(evt);
		},
		_$dragend: function(evt) {
			clearTimeout(this.timeout);
			evt.trajetory = this.points;
			this.core.contextInfo.$swipe = false;
		},
		_swipe: function(evt) {
			if (this.core.contextInfo.$swipe) {
				return;
			}
			var last, now = new Date().getTime();
			for (var i = 0, l = this.points.length, point; i < l; i++) {
				point = this.points[i];
				if (now - point.tick > this.delay) {
					break;
				}
				last = point;
			}
			if (!last) {
				return;
			}
			var time = new Date().getTime() - last.tick;
			var xy = this.points[0].xy;
			var dx = xy.x - last.xy.x;
			var dy = xy.y - last.xy.y;
			if (time < 1000 && Math.abs(dx) > this.swipe_width && Math.abs(dy) < this.swipe_height) {
				this.core.contextInfo.$swipe = true;
				this.core.emit('$swipe', evt);
				if (dx < 0) {
					this.core.emit('$swipeleft', evt);
				} else {
					this.core.emit('$swiperight', evt);
				}
			}
		}
	});
});