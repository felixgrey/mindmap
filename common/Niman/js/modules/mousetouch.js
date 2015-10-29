define(function(require, exports, module) {
	var common = require('common');
	var events = require('events');

	//计时器
	var Timer = function(interval) {
		this.running = false;
		this.interval = interval;
	};

	common.mix(Timer.prototype, {
		setCallback : function(context, callback) {
			var self = this;
			this.callback = function() {
				callback.apply(context);
				self.stop();
			}
		},
		run : function() {
			if (!this.running && this.callback) {
				this.running = true;
				clearTimeout(this.handle);
				this.handle = setTimeout(this.callback, this.interval);
			}
		},
		stop : function() {
			this.running = false;
			clearTimeout(this.handle);
		}
	});

	function Click(options) {
		this.downXY = {};
		this.touchmoved = false;
		this.timer = new Timer(this.interval);
		this.hasClick = null;
		options && common.mix(this, options);
	};

	Click.extendFrom(events.ComplexEvent);

	exports.Click = Click;

	common.mix(Click.prototype, {
		interval : 300,
		deviation : 5,
		name : 'Click',
		clickIntouchStart : true,
		init : function() {
			this.core.on('click', this, this._mClick);
			this.core.on('contextmenu', this, this._mContextmenu);
			this.core.on('mousemove', this, this._mMousemove);
			this.core.on('mousedown', this, this._mMousedown);
			this.core.on('mouseup', this, this._mMouseup);
			this.core.on('dblclick', this, this._mDblclick);
			this.core.on('touchstart', this, this._mTouchstart);
			this.core.on('touchmove', this, this._mTouchmove);
			this.core.on('touchend', this, this._mTouchend);
		},
		singleEvents : {
			left : '$lclick',
			right : '$rclick'
		},
		doubleEvents : {
			left : null,
			right : '$dbrclick'
		},
		_mTouchstart : function(evt) {
			this.core.emit('$down', evt);
			this.core.contextInfo.$down = true;
			if (this.clickIntouchStart) {
				this.core.contextInfo.quickClick = true;
				this.core.emit('$qlclick', evt);
			} else {
				var tts = evt.targetTouches;
				this.downXY.x = tts[0].clientX;
				this.downXY.y = tts[0].clientY;
			}
		},
		_mTouchmove : function(evt) {
			var tts = evt.targetTouches;
			if (!this.touchmoved) {	
				this.touchmoved = (Math.abs(this.downXY.x - tts[0].clientX) > this.deviation) || (Math.abs(this.downXY.y - tts[0].clientY) > this.deviation);
			}
			
			this.core.contextInfo.quickClick = true;
		},
		_mTouchend : function(evt) {
			if (!this.clickIntouchStart && !this.touchmoved) {
				this.core.emit('$qlclick', evt);
			}
			this.core.emit('$up', evt);
			this.core.contextInfo.$up = true;
			this.touchmoved = false;
			this.core.contextInfo.$down = false;
		},
		_mClick : function(evt) {
			if ('click' == evt.type) {
				this._doQclick(evt, 'left');
				this._doClick(evt, 'left');
			}
		},
		_doQclick : function(evt, btn) {
			if (this._isClick(evt)) {
				if ('left' == btn && !this.core.contextInfo.quickClick) {
					this.core.emit('$qlclick', evt);
				} else if ('right' == btn) {
					this.core.emit('$qrclick', evt);
				}
			}
			this.core.contextInfo.quickClick = false;
		},
		_mContextmenu : function(evt) {
			this._doClick(evt, 'right');
			this._doQclick(evt, 'right');
		},
		//如果鼠标移动时已经按下一次按钮，则立即触发单击事件。
		_mMousemove : function(evt) {
			if (!this._isClick(evt)) {
				//只有不是单击事件时才触发移动事件。
				this.core.emit('$mousemove', evt);
				this.hasDown && this.core.emit('$downmove', evt);
				if (this.hasClick) {
					this.hasClick.run();
					this.timer.stop();
				}
			}
		},
		//记录鼠标按下的位置。
		_mMousedown : function(evt) {
			this.hasDown = true;
			this.downXY.x = evt.clientX;
			this.downXY.y = evt.clientY;
			this.core.emit('$down', evt);
		},
		_mMouseup : function(evt) {
			if (!this.core.contextInfo.$up) {
				this.core.emit('$up', evt);
			}
			this.hasDown = false;
			this.core.contextInfo.$down = false;
			this.core.contextInfo.$up = false;
		},
		//一部分浏览器双击时触发一次单击事件一次双击事件；（IE7）
		//另一部分则触发两次单击事件一次双击事件。
		_mDblclick : function(evt) {
			this.core.emit('$dblclick', evt);
			this.timer.stop();
			this.hasClick = null;
		},
		_isClick : function(evt) {//根据鼠标按下和抬起的位置判断是否是单击
			return Math.abs(this.downXY.x - evt.clientX) <= this.deviation && Math.abs(this.downXY.y - evt.clientY) <= this.deviation;
		},
		_doClick : function(evt, btn) {
			var self = this;
			if (!self.hasClick) {//第一次点击，记录事件信息，开启计时器。
				var _evt = common.mix({}, evt);
				//计时结束的回调：计时结束后触发单击事件。
				self.hasClick = {
					btn : btn,
					run : function() {
						if (self._isClick(_evt)) {
							self.core.emit(self.singleEvents[btn], _evt);
						}
						self.hasClick = null;
					}
				};
				self.timer.setCallback(null, self.hasClick.run);
				self.timer.run();
			} else {//第二次点击，关闭计时器，不会触发单击事件。
				self.timer.stop();
				//如果两次点击是同一个按钮，触发双击事件。
				if (self.hasClick.btn == btn && self.doubleEvents[btn]) {
					self.core.emit(self.doubleEvents[btn], evt);
					self.hasClick = null;
					//不同则重新计时。
				} else {
					self.hasClick = null;
					self._doClick(evt, btn);
				}
			}
		}
	});

	function Wheel(event, options) {
		options && common.mix(this, options);
	};

	Wheel.extendFrom(events.ComplexEvent);

	exports.Wheel = Wheel;

	common.mix(Wheel.prototype, {
		name : 'Wheel',
		init : function() {
			this.core.on('mousewheel', this, this._onWheelEvent);
			this.core.on('DOMMouseScroll', this, this._onWheelEvent);
		},
		_onWheelEvent : function(evt) {
			evt.wheelStep = evt.wheelDelta ? (evt.wheelDelta / 120) : (-evt.detail / 3);
			if (evt.wheelStep > 0) {
				this.core.emit('$wheelup', evt);
			} else {
				this.core.emit('$wheeldown', evt);
			}
			this.core.emit('$wheel', evt);
		}
	});
});
