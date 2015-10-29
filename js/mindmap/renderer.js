define(function(require, exports, module) {
	var common = require('common');

	var calculateBound = function(points, border) {
		var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
		for (var i = 0; i < points.length; i++) {
			minX = Math.min(points[i].x, minX);
			minY = Math.min(points[i].y, minY);
			maxX = Math.max(points[i].x, maxX);
			maxY = Math.max(points[i].y, maxY);
		}
		return {
			minX : minX - border,
			minY : minY - border,
			maxX : maxX + border * 2,
			maxY : maxY + border * 2
		};
	};

	//SVG渲染
	var svgXmlns = 'http://www.w3.org/2000/svg';
	var svgRender = function(params, domParams, svg) {
		svg = svg || document.createElementNS(svgXmlns, 'svg');
		var polyline = svg.getElementsByTagName('polyline')[0] || document.createElementNS(svgXmlns, 'polyline');
		with (svg) {
			className = domParams.className;
			setAttribute('xmlns', svgXmlns);
			setAttributeNS(svgXmlns, 'version', '1.1');
			setAttributeNS(null, 'width', domParams.width);
			setAttributeNS(null, 'height', domParams.height);
			style.left = domParams.left + 'px';
			style.top = domParams.top + 'px';
			style.position = 'absolute';
			style.zIndex = 100;
			appendChild(polyline);
		}
		var pointsArr = [];
		with (params) {
			common.mix(polyline.style, {
				fill : 'transparent',
				stroke : color,
				strokeWidth : width,
				alpha : alpha
			});
			for (var i = 0; i < points.length; i++) {
				with (pointsArr) {
					push(points[i].x - domParams.left);
					push(',');
					push(points[i].y - domParams.top);
					push(' ');
				}
			}
		}
		polyline.setAttributeNS(null, 'points', pointsArr.join('').trim());
		return svg;
	};

	exports.drawCurve = function(params, dom) {
		var points = params.points;
		var color = params.color || 'black';
		var width = params.width || 1;
		var alpha = params.alpha || 1;
		var bound = calculateBound(points, width);
		var domParams = {
			left : bound.minX,
			top : bound.minY,
			width : bound.maxX - bound.minX,
			height : bound.maxY - bound.minY,
			className : 'MMnodeCurveDom'
		}

		if (!!document.createElementNS && !!document.createElementNS(svgXmlns, 'svg').createSVGRect) {
			//是否支持SVG
			return svgRender(params, domParams, dom)
		}
		return document.createElement('div');
	};

});

