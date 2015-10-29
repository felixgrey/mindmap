define(function(require, exports, module) {
	var common = require('common');

	var SimpleEditor = exports.SimpleEditor = function() {
		this.domNode = document.createElement('textarea');
		this.domNode.className = 'MMEditor';
	}

	common.mix(SimpleEditor.prototype, {
		getTitle : function() {
			return this.domNode.value;
		},
		setTitle : function(value) {
			this.domNode.value = value;
		},
		focus : function() {
			this.domNode.focus();
		}
	});

});
