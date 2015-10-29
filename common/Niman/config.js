(function() {

	var pluginPath = 'js/plugin';
	var modulesPath = 'js/modules';

	var configInfo = {
		plugin : ['definition', 'supports', 'application', 'css'],
		main : 'Niman_test',
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
			mousetouch : modulesPath + '/mousetouch.js',
			keyboard : modulesPath + '/keyboard.js',
			najax : modulesPath + '/najax.js',
			ndq:modulesPath + '/ndq.js',
			nvm:modulesPath + '/nvm.js',

			style : 'css/style.css',

			//应用
			data : 'data.js',
			Niman_test : 'Niman_test.js'
		}
	};

	Niman.config(configInfo);
})();
