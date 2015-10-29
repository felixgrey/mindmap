define(function(require, exports, module) {
	var common = require('common');
	var Widget = require('widget');
	
	var mousetouch = require('mousetouch');
	var events = require('events');
	var Nvm = require('nvm');

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.display = 'none';
	document.body.appendChild(div);
	
	var divEvents=events.listen(div,true);
	divEvents.addComplexEvents(new mousetouch.Click());
	divEvents.on('$down',null,function(){
		div.style.display = 'none';
	});

	

	return function(dom, wiewModel) {
		wiewModel.on('$editorshow',null,function(){
			
		});
	}
});
