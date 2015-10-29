define(function(require) {
	var ViewModel = require('viewmodel');

	console.log('ViewModel')

	var viewmodel = new ViewModel(document.getElementById("testDiv"));
	//document.getElementById("button").privateDom=true;

	viewmodel.bindModel({
		test : "test!!!",
		list:[]
	});
	
	for (var i=0;i<30;i++) {
		viewmodel.insertData('.list',i);
	}
	
	
//	viewmodel.on('change',null,function(){
//		console.log('change')
//	})
//	
//	viewmodel.on('click',null,function(){
//		console.log('click')
//	})

}); 
