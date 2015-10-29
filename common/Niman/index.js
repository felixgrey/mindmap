define(function(require) {
	var events = require('events');
	var dragger = require('dragger');
	var mousetouch = require('mousetouch');
	var keyboard = require('keyboard');

	

	var $ = require('ndq').$;

	var event = new mousetouch.Wheel(new mousetouch.Click(new dragger.Dragger(events.listen(document.getElementById("table")))));

	event.cancelDefault('touchstart')
	event.cancelDefault('mousedown')
	event.cancelDefault('mouseup')
	event.cancelDefault('click')

	document.body.onfocus = function() {
		return false;
	}
	var textarea = $('textarea')[0];
	

//	var b1=new touch.TouchDragger(events.listen(document.getElementById("dd1")))
//	
//	b1.on('$dragmove', null, function(evt) {
//		textarea.innerHTML +=evt.targetTouches.length
//		dragger.dragMove(evt);
//	});
//	
//	var b2=new touch.TouchDragger(events.listen(document.getElementById("dd2")))
//	
//	b2.on('$dragmove', null, function(evt) {
//		dragger.dragMove(evt);
//	});


	var bodyEvent = events.listen(document.body);
	bodyEvent.cancelDefault('touchmove')
	bodyEvent.cancelDefault('dblclick')
	bodyEvent.on('dblclick', null, function(evt) {
		textarea.innerHTML += evt.type + ' ';
	});

	event.on('$wheelup', this, function() {
		console.log(444)
	});

	function innerHTML(evt) {
		textarea.innerHTML += evt.type + ' ';
	}

//	event.on('mouseup',null,innerHTML);
//
//	event.on('mousemove',null,innerHTML);
//
//	event.on('touchmove',null,function(evt){
//		textarea.innerHTML +=evt.touches.length
//	});
//
//	event.on('touchend',null,innerHTML);
//
//	event.on('touchstart',null,innerHTML);
//
//	event.on('mousedown',null,innerHTML);

	event.on('$qlclick', null, function(evt) {
		var src = events.getSrcElement(evt);
		var tagName = src.tagName && src.tagName.toUpperCase();
		if (new RegExp('TD|DIV', 'g').test(tagName)) {
			textarea.innerHTML += events.getSrcElement(evt).innerText;
		}

	});

//	event.on('touchend', null, function(evt) {
//		textarea.innerHTML += 'touchend';
//	});

	//event.on('click',null,innerHTML);

	event.on('$dragmove', null, function(evt) {
		dragger.dragMove(evt);
	});

	var key = new keyboard.Key(events.listen(window));

	key.on('$keydown:p', this, function() {
		console.log('rrr')
	});

});
