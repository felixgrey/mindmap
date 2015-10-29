(function() {

	var pluginPath = '../niman/plugin';
	var modulesPath = '../niman/modules';
	var appPath = '../mindmap';

	var configInfo = {
		plugin : ['definition', 'supports', 'application', 'css'],
		main:'ajaxTest',
		location : {
			//插件
			supports : pluginPath + '/supports.js',
			definition : pluginPath + '/definition.js',
			application : pluginPath + '/application.js',
			css : pluginPath + '/css.js',

			//基础模块
			common : modulesPath + '/common.js',
			util : modulesPath + '/util.js',
			events : modulesPath + '/events.js',
			dragger : modulesPath + '/dragger.js',
			mouse : modulesPath + '/mouse.js',
			keyboard : modulesPath + '/keyboard.js',
			ajax : modulesPath + '/ajax.js',
			squery : modulesPath + '/squery.js',
			dataview : modulesPath + '/dataview.js',

			//应用模块
			geometry : appPath + '/geometry.js',
			renderer : appPath + '/renderer.js',
			panel : appPath + '/panel.js',
			nodeCurve : appPath + '/nodeCurve.js',
			containerEvents : appPath + '/containerEvents.js',
			dataParser : appPath + '/dataParser.js',
			editor : appPath + '/editor.js',
			io : appPath + '/io.js',
			mindmap : appPath + '/mindmap.js',
			style : 'css/style.css'
		}
	};

	Niman.config(configInfo);
})();
