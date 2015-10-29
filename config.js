(function() {
	var server='./';
	var globleInfo=window.globleInfo;
	if(globleInfo&&globleInfo.server){
		server=globleInfo.server;
	}	
	var pluginPath = server+'/common/Niman/js/plugin';
	var modulesPath = server+'/common/Niman/js/modules';
	var widgets = server+'/widgets/editor';
	var app=server+'';
	var appjs=app+'/js/mindmap';

	var configInfo = {
		plugin : ['definition', 'supports', 'application', 'css'],
		main : 'index',
		location : {

			//插件
			supports : pluginPath + '/supports.js',
			definition : pluginPath + '/definition.js',
			application : pluginPath + '/application.js',
			css : pluginPath + '/css.js',

			//基础模块
			common : modulesPath + '/common.js',
			utils : modulesPath + '/utils.js',
			events : modulesPath + '/events.js',
			dragger : modulesPath + '/dragger.js',
			mousetouch : modulesPath + '/mousetouch.js',
			keyboard : modulesPath + '/keyboard.js',
			ajax : modulesPath + '/ajax.js',

			//应用模块
			geometry : appjs + '/geometry.js',
			renderer : appjs + '/renderer.js',
			panel : appjs + '/panel.js',
			nodeCurve : appjs + '/nodeCurve.js',
			containerEvents : appjs + '/containerEvents.js',
			dataParser : appjs + '/dataParser.js',		
			io : appjs + '/io.js',
			mindmap : appjs + '/mindmap.js',
			style : app+'/css/style.css',
			
			//组件
			editor : widgets + '/editor.js',

			//应用
			data : app+'/data.js',
			index :app+ '/index.js'
		}
	};

	Niman.config(configInfo);
})();
