define(function(require, exports, module) {
	require('style');
	var common = require('common');
	var dataParser = require('dataParser');
	var containerEvents = require('containerEvents');
	var io = require('io');

	function downloadA(name, _type, dataStr) {
		name = name || 'data.json';
		var a = document.createElement('a');
		a.setAttribute('download', name);
		a.setAttribute('href', _type + dataStr);
		a.click();
	};

	var MindMap = module.exports = function(id) {
		this.dom = document.getElementById(id) || document.createElement('div');
		this.parser = new dataParser.Parser(this.dom);
		this.containerEvents = new containerEvents.EventsManager(this.parser);
		this.dropLoader = new io.DropLoader();
		this.dropLoader.listen(this.dom);
		this._init();
	};
	
	MindMap.baseZindexMap=dataParser.baseZindexMap;

	common.mix(MindMap.prototype, {
		_init : function() {
			this.dropLoader.on('$loaddata', this, function(data) {
				this.clear();
				this.readData(data);
			});
			var position = {
				x : this.dom.offsetWidth / 2,
				y : this.dom.offsetHeight / 2
			};
			position.x = position.x ? position.x - 50 : 0;
			position.y = position.y ? position.y - 50 : 0;
			this.readData({
				tree : {
					id : common.createId(),
					title : 'Central Idea',
					position : position,
					visible : true,
					style : {},
					parentId : null,
					children : []
				}
			});
		},
		zIndex : function(name) {
			return this.parser.zIndex(name);
		},
		download : function(name) {
			if (this.data) {
				io.downloadA(name, 'data:text/plain,', JSON.stringify(this.data));
			}
		},
		downloadImage : function(name) {
			if (this.data) {
				//io.download(name, 'data:image/png;base64,', JSON.stringify(this.data));
			}
		},
		clear : function() {
			if (this.data) {
				this.parser.remove(this.data.tree.id, true);
				this.data = null;
			}
		},
		readData : function(data) {
			this.clear();
			this.data = data;
			this.parser.parse(data.tree);
		}
	});

});
