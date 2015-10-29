define(function(require) {
	var NPromise = require('npromise');
	var inertia = require('inertia');
	var ndq = require('ndq');

	var _S = ndq.$(document).find(function(dom) {
		return dom.getAttribute && 'bbbs' == dom.getAttribute('aaa')
	});

	//console.log(_S)
	var list = [];
	var _Promise = NPromise;
	//var _Promise=Promise;

	for (var i = 0; i < 4; i++) {
		list.push(new _Promise(function() {
		}))
	}

	list.push(new _Promise(function(resolve) {
		resolve('aa')
	}))

	_Promise.race(list).then(function(p) {
		//console.log(p)
	});

	var aa = 0
	var nPromise = new NPromise(function(r1, r2) {
		r1();
	}).then(function() {
		aa = 1;
		console.log(aa);
	})
	var kk = '';
	for (var i = 0; i < 999999; i++) {
		for (var j = 0; j < 999999; j++) {
			kk += 'a';
		}
	}

	//console.log(Promise.from)

	//	list.push(_Promise.reject('a'))
	//	var p2=_Promise.resolve('i');
	//	var p=_Promise.cast(p2);
	//	console.log(p==p2)

	//	_Promise.all(list).then(function(p){
	//		console.log(p)
	//	}).catch(function(p){
	//		console.log(p)
	//	});

});
