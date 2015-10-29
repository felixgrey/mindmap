(function() {

	var server = 'http://localhost:8020/webApp';
	var globleInfo = window.globleInfo;
	if (globleInfo && globleInfo.server) {
		server = globleInfo.server;
	}
	var pluginPath = server + '/common/Niman/js/plugin';
	var modulesPath = server + '/common/Niman/js/modules';
	var widgetPath = server + '/common/Niman/js/widgets';
	var widgets = server + '/widgets/editor';
	var framework=server+ '/common/Niman/js/framework';

	var configInfo = {
		plugin : ['definition', 'supports', 'application', 'css', 'framework'],
		main : 'Niman_test',
		location : {

			//插件
			supports : pluginPath + '/supports.js',
			definition : pluginPath + '/definition.js',
			application : pluginPath + '/application.js',
			css : pluginPath + '/css.js',
			framework : pluginPath + '/framework.js',

			//基础模块
			common : modulesPath + '/common.js',
			utils : modulesPath + '/utils.js',
			events : modulesPath + '/events.js',
			dragger : modulesPath + '/dragger.js',
			mousetouch : modulesPath + '/mousetouch.js',
			keyboard : modulesPath + '/keyboard.js',
			najax : modulesPath + '/najax.js',
			ndq:modulesPath + '/ndq.js',
			nvm:modulesPath + '/nvm.js',
			npromise:modulesPath+ '/npromise.js',
			inertia:modulesPath+ '/inertia.js',
			nanimation : modulesPath + '/nanimation.js',
			viewmodel : framework + '/viewmodel.js',
			widget : framework + '/widget.js',

			style : 'css/style.css',
			
			//控件
			button : widgetPath + '/button.js',
			page : widgetPath + '/page.js',

			//应用
			data : 'data.js',
			Niman_test : 'Niman_test.js'
		}
	};

	Niman.config(configInfo);
})();
