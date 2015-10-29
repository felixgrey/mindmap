define(function(require) {
	var events = require('events');
	var dragger = require('dragger');
	var mousetouch = require('mousetouch');
	var keyboard = require('keyboard');
	var inertia = require('inertia');

	var $ = require('ndq').$;

	console.log($('div').css('z-index', 50), $('td')[0]);

	//var event=new mouse.Wheel(new mouse.Click(new dragger.Dragger(events.listen(document.getElementById("table")))));

	var event = events.listen(document.getElementById("table"));
	event.addComplexEvents(new dragger.Dragger(), new keyboard.Key(), new mousetouch.Click(), new mousetouch.Wheel());
	event.addComplexEvents(new inertia.Dragger());
	

	event.on('click', this, function() {
		console.log(111)
	});

	event.on('$qlclick', this, function() {
		console.log(999)
	});

	event.on('$wheelup', this, function() {
		console.log(444)
	});

	event.on('$lclick', this, function() {
		console.log(333)
	});

	event.on('$rclick', this, function() {
		console.log(666)
	});

	event.on('$dragmove', null, function(evt) {
		//console.log(evt.clientX, evt.clientY)
		dragger.dragMove(evt);
	});

	var key = events.listen(window).addComplexEvents(new keyboard.Key());

	key.on('$keydown:p', this, function() {
		console.log('rrr')
	});
});
