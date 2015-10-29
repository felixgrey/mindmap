define(function(require, exports, module) {
	var common = require('common');
	var events = require('events');

	exports.KEY_VALUE = {
		192 : '`',
		49 : '1',
		50 : '2',
		51 : '3',
		52 : '4',
		53 : '5',
		54 : '6',
		55 : '7',
		56 : '8',
		57 : '9',
		48 : '0',
		189 : '-',
		187 : '=',
		8 : 'back',
		45 : 'insert',
		36 : 'home',
		33 : 'pageup',
		81 : 'q',
		87 : 'w',
		69 : 'e',
		82 : 'r',
		84 : 't',
		89 : 'y',
		85 : 'u',
		73 : 'i',
		79 : 'o',
		80 : 'p',
		219 : '[',
		221 : ']',
		220 : '\\',
		91 : 'win',
		110 : 'r.',
		35 : 'end',
		34 : 'pagedown',
		65 : 'a',
		83 : 's',
		68 : 'd',
		70 : 'f',
		71 : 'g',
		72 : 'h',
		74 : 'j',
		75 : 'k',
		76 : 'l',
		186 : ';',
		222 : '\'',
		13 : 'enter',
		27 : 'esc',
		93 : 'menu',
		46 : 'delete',
		90 : 'z',
		88 : 'x',
		67 : 'c',
		86 : 'v',
		66 : 'b',
		78 : 'n',
		77 : 'm',
		188 : ',',
		190 : '.',
		191 : '/',
		38 : 'up',
		40 : 'down',
		37 : 'left',
		39 : 'right',
		122 : 'f11',
		123 : 'f12',
		17 : 'ctrl',
		18 : 'alt',
		16 : 'shift',
		32 : 'space',
		144 : 'num',
		112 : 'f1',
		113 : 'f2',
		114 : 'f3',
		115 : 'f4',
		116 : 'f5',
		117 : 'f6',
		118 : 'f7',
		119 : 'f8',
		120 : 'f9',
		121 : 'f10',
		96 : 'r0',
		97 : 'r1',
		98 : 'r2',
		99 : 'r3',
		100 : 'r4',
		101 : 'r5',
		102 : 'r6',
		103 : 'r7',
		104 : 'r8',
		105 : 'r9',
		111 : 'r/',
		106 : 'r*',
		109 : 'r-',
		107 : 'r+'
	};
	exports.KEY_CODE = {};
	for (var k in exports.KEY_VALUE) {
		exports.KEY_CODE[k] = exports.KEY_VALUE[k];
	}

	function Key(options) {
		this.pressingKey = {};
		this.onKeyValueMap = {};
		options&&common.mix(this,options);
	};

	Key.extendFrom(events.ComplexEvent);

	exports.Key = Key;

	common.mix(Key.prototype, {
		name : 'Key',
		init : function() {
			this.core.on('keydown', this, this._keydown);
			this.core.on('keyup', this, this._keyup);
			this.core.on('keypress', this, this._keydown);
		},
		_keydown : function(evt) {
			var kv = exports.KEY_VALUE[evt.keyCode];
			evt.KEY_VALUE = kv;
			this.pressingKey[kv] = true;
			this.core.emit('$keydown', evt);
			kv = evt.altKey ? 'alt+' + kv : kv;
			kv = evt.ctrlKey ? 'ctrl+' + kv : kv;
			this.core.emit('$keydown:' + kv, evt);
		},
		_keyup : function(evt) {
			var kv = exports.KEY_VALUE[evt.keyCode];
			evt.KEY_VALUE = kv;
			this.pressingKey[kv] = false;
			this.core.emit('$keyup', evt);
			kv = evt.altKey ? 'alt+' + kv : kv;
			kv = evt.ctrlKey ? 'ctrl+' + kv : kv;
			this.core.emit('$keyup:' + kv, evt);
		}
	});
});
