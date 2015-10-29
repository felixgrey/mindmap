define(function(require, exports, module) {
	var common = require('common');
	var geometry = require('geometry');
	var Point = geometry.Point;

	//起止点线段长度
	var width = 50;

	var llrr = function(p1, p2, ll) {
		var x = ll == 'll' ? Math.min(p1.x, p2.x) : Math.max(p1.x, p2.x);
		var _c = ll == 'll' ? -1 : 1;
		var p12, p22, mid;
		p12 = new Point(p1.x + _c * width, p1.y);
		p22 = new Point(p2.x + _c * width, p2.y);
		mid = p12.add(p22).multi(0.5);
		mid.x = x + _c * 50;
		return [p1, p12, mid, p22, p2];
	};

	var lrrl = function(p1, p2, lr) {
		var _c = lr == 'lr' ? -1 : 1;
		var p12, p13, p22, p23, mid;
		mid = p1.add(p2).multi(0.5);
		p12 = new Point(p1.x + _c * width, p1.y);
		p13 = new Point(mid.x, p1.y);
		p22 = new Point(p2.x - _c * width, p2.y);
		p23 = new Point(mid.x, p2.y);
		return [p1, p12, p13, mid, p23, p22, p2];
	};

	var flr = function(p1, p2, l) {
		var _c = l == 'l' ? -1 : 1;
		p22 = new Point(p2.x + _c * width * 2, p2.y);
		return [p1, p22, p2];
	};

	var lrMap = {
		ll : function(p1, p2) {
			return llrr(p1, p2, 'll');
		},
		rr : function(p1, p2) {
			return llrr(p1, p2, 'rr');
		},
		lr : function(p1, p2) {
			return lrrl(p1, p2, 'lr');
		},
		rl : function(p1, p2) {
			return lrrl(p1, p2, 'rl');
		},
		fl : function(p1, p2) {
			return flr(p1, p2, 'l');
		},
		fr : function(p1, p2) {
			return flr(p1, p2, 'r');
		}
	};

	//贝塞尔曲线
	var bezierCurve = exports.bezierCurve = function(p1, lr1, p2, lr2) {
		return geometry.drawBezier(100, lrMap[lr1+lr2](p1, p2));
	};

	//选择DOM端点合适的点
	var CurveForDom = exports.curveForDom = function(p1, p2, p3, p4, f) {
		var ps;
		var m1 = p2.x > p3.x && p2.x < p4.x;
		var m2 = p1.x > p3.x && p1.x < p4.x;
		var rr1 = m1 && p4.x - p2.x < p2.x - p3.x;
		var ll1 = m1 && p4.x - p2.x > p2.x - p3.x;
		var rr2 = m2 && p4.x - p1.x < p1.x - p3.x;
		var ll2 = m2 && p4.x - p1.x > p1.x - p3.x;
		if (rr1 || rr2) {
			ps = [p2, 'r', p4, 'r'];
		} else if (ll1 || ll2) {
			ps = [p1, 'l', p3, 'l'];
		} else {
			ps = p2.distance(p3) < p1.distance(p4) ? [p2, 'r', p3, 'l'] : [p1, 'l', p4, 'r'];
		}
		if (f) {
			ps[1] = 'f';
			ps[0] = p1.add(p2).multi(0.5);
		}
		return bezierCurve(ps[0], ps[1], ps[2], ps[3]);
	};
});

