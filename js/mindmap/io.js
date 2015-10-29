define(function(require, exports, module) {
	var common = require('common');
	var events = require('events');

	var stop = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	};

	exports.downloadA = function(name, _type, dataStr) {
		name = name || 'data.json';
		var a = document.createElement('a');
		a.setAttribute('download', name);
		a.setAttribute('href', _type + dataStr);
		a.click();
	};

	var DropLoader = exports.DropLoader = function() {
		events.Event.apply(this, arguments);
	}

	common.mix(DropLoader.prototype, events.Event.prototype, {
		listen : function(dom) {
			this.drag = events.listen(dom);
			this.drag.on('dragenter', null, stop);
			this.drag.on('dragover', null, stop);
			this.drag.on('drop', null, stop);
			this.drag.on('drop', this, this._drop);
		},
		_drop : function(evt) {
			var file = evt.dataTransfer.files[0];
			var reader = new FileReader();
			var self = this;
			reader.onload = function(evt) {
				self.emit('$loaddata', JSON.parse(events.getSrcElement(evt).result));
				reader.onload = null;
			}
			reader.readAsText(file);
		}
	});

});
