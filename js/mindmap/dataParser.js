define(function(require, exports, module) {
	var common = require('common');
	var geometry = require('geometry');
	var renderer = require('renderer');
	var nodeCurve = require('nodeCurve');

	var Point = geometry.Point;

	var getStyle = function(style) {
		return {
			color : style.color || '#000000',
			width : parseInt(style.width) || 1,
			alpha : parseFloat(style.alpha) || 1
		}
	};

	exports.baseZindexMap = {
		canvas : 1000,
		innerDiv : 3000,
		pointDiv : 5000,
		maxZindex : 6000,
		panel : 7000
	};

	var Parser = exports.Parser = function(dom) {
		this.dom = dom;
		dom.setAttribute('dragSwitch', 'on');
		dom.setAttribute('type', 'container');
		dom.className = 'MMcontainerDiv';
		this.table = {};
		this.maxZindex = common.mix({}, exports.baseZindexMap);

		var self = this;
		this._stack = function(id, _track, _stack) {
			var track = _track || {};
			var stack = _stack || [];
			var root = self.table[id];
			stack.push(root);
			var _f = arguments.callee, children = root.data.children;
			for (var i = 0; i < children.length; i++) {
				_f(children[i].id, common.mix({}, track), stack);
			}
			return stack;
		}
	};

	common.mix(Parser.prototype, {
		width : 100,
		height : 40,
		rootLineWidth : 14,
		startOffset : 0,
		zIndex : function(name) {
			return ++this.maxZindex[name];
		},
		_render : function(id) {
			var _d = this.table[id];
			var data = _d.data;
			var div = _d.div;
			var style = data.style;
			div.style.left = data.position.x + 'px';
			div.style.top = data.position.y + 'px';
			div.style.borderBottom = 'solid ' + style.color + ' ' + style.width + 'px';
			div.firstChild.innerHTML = data.title;
			if (data.parentId) {
				var _pd = this.table[data.parentId];
				var _width = this.height + (_pd.data.style.width || this.startOffset) / 2;
				var _width2 = data.position.y + this.height + style.width / 2;
				var p1 = new Point(1, _width);
				var p2 = new Point(this.width - 1, _width);
				var p3 = new Point(data.position.x + 1, _width2);
				var p4 = new Point(data.position.x - 1 + this.width, _width2);
				var points = nodeCurve.curveForDom(p1, p2, p3, p4, !this.table[data.parentId].data.parentId);
				var canvas = renderer.drawCurve({
					points : points,
					color : style.color,
					width : style.width,
					alpha : style.alpha
				}, _d.canvas);
				_d.canvas = canvas;
				if (!_d.canvas.style.zindex) {
					_d.canvas.style.zindex = this.zIndex(canvas);
				}
				if (!_pd.data.visible) {
					div.style.dispaly = 'none';
					canvas.style.dispaly = 'none';
				}
				_pd.div.appendChild(canvas);
				_pd.div.appendChild(div);
			} else {
				this.dom.appendChild(div);
				this.rootDom = div;
			}
		},
		remove : function(id, root) {
			var parentId = this.table[id].data.parentId;
			if (root || parentId) {
				var stack = this._stack(id), _d;
				while ( _d = stack.pop()) {
					_d.div.parentNode.removeChild(_d.div);
					if (parentId) {
						_d.canvas.parentNode.removeChild(_d.canvas);
						var children=this.table[_d.data.parentId].data.children;
						for(var key in children){
							if(_d.data==children[key]){
								delete children[key];
								break;
							}
						}
					}
					delete this.table[_d.data.id];
					delete _d.div;
					delete _d.canvas;
					delete _d.data;
				}
			}
		},
		add : function(data) {
			this.table[data.parentId].data.children.push(data);
			this.parse(data);
		},
		parse : function(data) {
			if(!data){
				return;
			}
			var style = getStyle(data.style);
			var div = document.createElement('div');
			div.setAttribute('type', 'border');
			div.style.zIndex = this.zIndex('canvas');
			var innerDiv = document.createElement('div');
			innerDiv.className = 'MMnodeInnerDiv MMnodeInnerDivHover';
			innerDiv.style.zIndex = this.zIndex('innerDiv');
			div.appendChild(innerDiv);
			div.style.width = this.width + 'px';
			div.style.height = this.height + 'px';
			div.className = 'MMnodeDiv';
			div.setAttribute('dragSwitch', 'on');
			div.setAttribute('data-id', data.id);
			innerDiv.setAttribute('type', 'inner');
			innerDiv.setAttribute('data-id', data.id);
			this.table[data.id] = {
				data : data,
				div : div,
				inner : innerDiv
			};
			if (!data.parentId) {
				innerDiv.className = innerDiv.className + ' MMrootNodeInnerDiv';
			}
			this._render(data.id);
			for (var i = 0; i < data.children.length; i++) {
				this.parse(data.children[i]);
			}
		}
	});

});
