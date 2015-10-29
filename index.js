define(function(require) {

	var MindMap = require('mindmap');
	var mindmap = new MindMap('mindmap');	
	var button=document.getElementById("button");

	button.style.zIndex=mindmap.zIndex('panel');
	button.onclick = function() {
		mindmap.download('data.json');
	}
}); 