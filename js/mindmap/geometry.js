define(function(require, exports, module) {
	var common = require('common');

	//Point类
	var Point = exports.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	common.mix(Point.prototype, {
		add : function(point) {
			return new Point(this.x + point.x, this.y + point.y);
		},
		sub : function(point) {
			return new Point(this.x - point.x, this.y - point.y);
		},
		multi : function(coefficient) {
			return new Point(this.x * coefficient, this.y * coefficient);
		},
		distance : function(point) {
			return Math.sqrt((point.x - this.x) * (point.x - this.x) + (point.y - this.y) * (point.y - this.y));
		},
		toString : function() {
			return this.x + ',' + this.y;
		}
	});

	//计算杨辉三角第N行
	var calculatePascalsTriangleN = function(n) {
		var arr = [];
		while (arr.length < n) {
			for ( i = 0; i < arr.length - 1; i++) {
				arr[i] = arr[i] + arr[i + 1];
			}
			arr.splice(0, 0, 1);
		}
		return arr;
	};

	//根据N阶贝塞尔曲线公式算点
	var createBezierFormula = function(pointArr) {

		var start = pointArr[0], n = pointArr.length, coefficients = calculatePascalsTriangleN(n);
		//N阶贝塞尔曲线公式
		var getPi = function(i, t) {
			return pointArr[i].multi(Math.pow(t, i) * Math.pow(1 - t, n - 1 - i) * coefficients[i]);
		};

		return function(t) {
			var point = getPi(0, t);
			for (var i = 1; i < n; i++) {
				point = point.add(getPi(i, t));
			}
			return point;
		}
	};

	//得到包含n点的贝塞尔曲线
	exports.drawBezier = function(n, pointArr) {
		var formula = createBezierFormula(pointArr);
		var curve = [];
		for (var i = 0; i < n; i++) {
			curve.push(formula(i / (n - 1)));
		}
		return curve;
	};
	
});

