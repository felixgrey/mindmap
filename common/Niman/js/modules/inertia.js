define(function(require, exports, module) {
	var common = require('common');
	var utils = require('utils');
	var events = require('events');
	var nanimation = require('nanimation');

	function Inertia(options) {
		options && common.mix(this, options);
	};

	common.mix(Inertia.prototype, {
		running : false,
		deceleration : 0.001,
		run : function(speed) {
			if (this.running) {
				return;
			}
			this.speed = speed;
			this.distance = 0;
			this.running = true;
			var self = this;
			var intervalFun = function() {
				var now = new Date().getTime();
				self.lastTime = self.lastTime || now;
				var time = now - self.lastTime;
				self.lastTime = now;
				var speed = self.speed - self.deceleration * time;
				self.speed = speed;
				if (speed <= 0) {
					self.speed = speed = 0;
					self.stop();
					return;
				}
				var dd = (self.speed + speed) / 2 * time;
				self.distance = Math.round(self.distance + dd);
				self.callback && self.callback.call(self.scope, self.distance, dd, speed);
			};
			this.intervalId = nanimation.start(intervalFun);
		},
		setAction : function(scope, callback) {
			this.scope = scope;
			this.callback = callback;
		},
		stop : function() {
			if (!this.running) {
				return;
			}
			nanimation.stop(this.intervalId);
			this.speed = 0;
			this.running = false;
		}
	});

	exports.Inertia = Inertia;

	function Dragger(inertia) {
		if (inertia) {
			this.inertia = inertia
		} else {
			this.inertia = new Inertia();
		}
		this.inertia.setAction(this, this._move);
		this.xy = {};
		this.info = {};
		this.points = [];
		this.evt = {
			Inertia_Dragger : true,
			xy : {
				x : 0,
				y : 0
			}
		};
	};

	exports.Dragger = Dragger;

	Dragger.extendFrom(events.ComplexEvent);

	common.mix(Dragger.prototype, {
		name : 'Inertia_Dragger',
		delay : 200,
		nbPoints : 100,
		_move : function(distance, dd, speed) {
			if (this.evt.dragInfo) {
				var evt = utils.clone(this.evt), mxy = evt.dragInfo.mouseXY;
				evt.xy = {
					x : parseInt(evt.xy.x + this.info.a / this.info.c * distance),
					y : parseInt(evt.xy.y + this.info.b / this.info.c * distance)
				};
				this.core.emit('$dragmove', evt);
			} else {
				this.stop();
			}
		},
		stop : function() {
			this.inertia.stop();
		},
		init : function() {
			this.core.on('$dragend', this, this._$dragend);
			this.core.on('$dragmove', this, this._$dragmove);
			this.core.on('$dragstart', this, this._$dragstart);
		},
		_$dragmove : function(evt) {
			if (evt.Inertia_Dragger) {
				return;
			}
			this.points.unshift({
				xy : {
					x : evt.xy.x,
					y : evt.xy.y
				},
				tick : new Date().getTime()
			});
			if (this.points.length > this.nbPoints) {
				this.points.pop();
			}
			this.evt.dragInfo = utils.clone(evt.dragInfo);
		},
		_$dragstart : function(evt) {
			this.stop();
		},
		_$dragend : function(evt) {
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
			var time = now - last.tick;
			var xy = this.points[0].xy;
			this.info.a = xy.x - last.xy.x;
			this.info.b = xy.y - last.xy.y;
			this.info.c = Math.sqrt(Math.pow(this.info.a, 2) + Math.pow(this.info.b, 2));
			if (!isNaN(this.info.c)) {
				this.info.v = this.info.c / time;
				this.evt.xy.x = xy.x;
				this.evt.xy.y = xy.y;
				this.inertia.run(this.info.v);
			}
		}
	});

});

