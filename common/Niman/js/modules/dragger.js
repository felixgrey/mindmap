define(function(require, exports, module) {
	var common = require('common');
	var events = require('events');
	var disableSelect = common.createId('.disableSelect_');

	//firefox和opera不支持onselectstart事件，需要用样式设置可否选择。
	if (/opera|firefox/g.test(common.BROWSER_NAME)) {
		var style = document.createElement('style');
		style.innerHTML = disableSelect + ' { -moz-user-select: none; }';
		var head = document.getElementsByTagName('head')[0] || document.documentElement;
		head.appendChild(style);
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

	function Dragger(options) {
		this.hasDown = false;
		this.dragInfoMap = {};
		options && common.mix(this, options);
	};

	Dragger.extendFrom(events.ComplexEvent);

	exports.disableSelectd = function(dom) {
		dom.onselectstart = function() {
			return false;
		};
		className(dom, disableSelect, true);
	}

	common.mix(Dragger.prototype, {
		mutiTouch : true,
		name : 'Dragger',
		init : function() {
			var self = this;
			self.core.on('mousedown', self, self._dMousedown);
			self.core.on('touchend', self, self._dTouchend);
			self.core.on('mousemove', self, self._dMousemove);
			self.core.on('mouseup', self, self._dMouseup);
			self.core.on('touchstart', self, self._dTouchstart);
			self.core.on('touchmove', self, self._dTouchmove);
			self.core.on('touchend', self, self._dTouchend);
			this.docMove = function(evt) {
				//console.log(evt)
				events.positionInfo(evt);
				self._dMousemove(evt);
			};
			this.docUp = function(evt) {
				events.positionInfo(evt);
				self._dMouseup(evt);
			};
			events.eventBus.on('mouseup', this, self.docUp);
			events.eventBus.on('mousemove', this, this.docMove);
		},
		getMutiDragElement : function(emt, evt) {
			//找父节点
			var src = events.findElement(emt, function(element) {
				return null !== element.getAttribute('dragSwitch');
			});
			if (!src || 'on' != src.getAttribute('dragSwitch')) {
				return null;
			}
			return src;
		},
		_dTouchstart : function(evt) {
			this.core.contextInfo.touchStart = true;
			var tts = evt.targetTouches;
			if (tts) {
				for (var i = 0; i < tts.length; i++) {
					var src = this.getDragElement(tts[i].target);
					this.dragInfoMap[tts[i].identifier] = {
						src : src,
						srcXY : {
							x : parseInt(src.style.left.replace('px', '')) || 0,
							y : parseInt(src.style.top.replace('px', '')) || 0
						},
						mouseXY : {
							x : tts[i].clientX,
							y : tts[i].clientY
						}
					}
				}
			}
			this.core.emit('$dragstart', evt);
		},
		_dTouchend : function(evt) {
			this.core.contextInfo.touchStart = false;
			this.core.emit('$dragend', evt);
			this._dMouseup(evt);
		},
		_dTouchmove : function(evt) {
			var tts = evt.targetTouches, length = 1;
			if (tts) {
				if (this.mutiTouch) {
					length = tts.length;
				}
				for (var i = 0; i < length; i++) {
					var emt = tts[i].target;
					var src = this.getMutiDragElement(emt, evt);
					evt.dragInfo = this.dragInfoMap[tts[i].identifier];
					evt.xy = {
						x : tts[i].clientX,
						y : tts[i].clientY
					}
					this.core.emit('$dragmove', evt);
				}
			}
		},
		getDragElement : function(emt) {
			//找父节点
			var src = events.findElement(emt, function(element) {
				return null !== element.getAttribute('dragSwitch');
			}, this.core.bindElement);
			if (!src || 'on' != src.getAttribute('dragSwitch')) {
				return null;
			}
			return src;
		},
		//拖拽时不可选中
		_selectAble : function(able) {
			var emts = {
				a : this.core.bindElement,
				b : this.dragInfo.src,
				c : document
			};
			for (var k in emts) {
				emts[k].onselectstart = function() {
					return able;
				};
				className(emts[k], disableSelect, !able);
			}
		},
		_dMousedown : function(evt) {
			if (this.hasDown) {//多点触摸时只取第一点
				return;
			}
			this.hasDown = true;
			var emt = this.core.bindElement;
			events.observeElement(document, 'mouseup', this.docUp);
			events.observeElement(document, 'mousemove', this.docMove);
			var src = this.getDragElement(events.getSrcElement(evt));
			if (!src) {
				return;
			};
			this.dragInfo = {
				src : src,
				srcXY : {
					x : parseInt(src.style.left.replace('px', '')) || 0,
					y : parseInt(src.style.top.replace('px', '')) || 0
				},
				mouseXY : {
					x : evt.clientX,
					y : evt.clientY
				}
			};
			this.srcDraggable = src.getAttribute('draggable');
			src.setAttribute('draggable', 'false');
			this._selectAble(false);
			this.core.emit('$dragstart', evt);
		},
		_dMousemove : function(evt) {
			if (this.hasDown && this.dragInfo && this.dragInfo.src && !this.core.contextInfo.touchStart) {
				evt.dragInfo = this.dragInfo;
				this.core.emit('$dragmove', evt)
			}
		},
		_dMouseup : function(evt) {
			this.hasDown = false;
			if (this.dragInfo && this.dragInfo.src) {
				if (this.srcDraggable) {
					this.dragInfo.src.setAttribute('draggable', this.srcDraggable)
				} else {
					this.dragInfo.src.removeAttribute('draggable');
				}
				this._selectAble(true);
				this.core.emit('$dragend', evt);
			}
			this.dragInfo = null;
			this.draggingElement = null;
			events.stopObserveElement(document, 'mousemove', this.docMove);
			events.stopObserveElement(document, 'mouseup', this.docUp);
		}
	});

	exports.Dragger = Dragger;

	exports.dragMove = function(evt, xy) {
		var _ = evt.dragInfo;
		var left = _.srcXY.x + evt.xy.x - _.mouseXY.x;
		var top = _.srcXY.y + evt.xy.y - _.mouseXY.y;
		(!xy || 'x' == xy || 'xy' == xy) && (_.src.style.left = left + 'px');
		(!xy || 'y' == xy || 'xy' == xy) && (_.src.style.top = top + 'px');
		return {
			x : left,
			y : top
		};
	};
});

