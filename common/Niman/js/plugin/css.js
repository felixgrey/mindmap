Niman.plugin('css', ['supports'], function(info) {
	var moduleLoader = info.moduleLoader, getPage = moduleLoader.getPage, supports = info.supports;

	info.getPagePolicy['\\.css$'] = function(url, callback) {
		var name = supports.getId(info.config.location, url);
		var link = document.createElement('link');
		info.moduleFactory.getModule(name).define([], function() {
		});
		var cbk = function(evt) {
			info.moduleFactory.getModule(name).readyState.setOk();
			callback && callback(link, evt);
		}
		
		if(info.config.cssReady){
			link.onload = link.onerror = cbk;			
		}else{
			cbk({});
		}
		
		with (link) {
			rel = "stylesheet";
			rev = "stylesheet";
			type = "text/css";
			media = "screen";
			href = url;
		}
		info.head.appendChild(link);
	}
});
