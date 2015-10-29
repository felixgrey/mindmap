define(function(require, exports, module) {
	var common = require('common');
	var util = require('util');
	var ajax = require('ajax');
	var $ = require('squery').$;
	var DataView = require('dataview').DataView;

	var param = {
		url : 'ajax.jsonp',
		callback : 'callback123',
		type : 'get',
		success : function(data) {
			console.log(data)
		}
	};

	var dataView = new DataView($('#table')[0]);

	var data = {
		list : []
	};

	for (var i = 0; i < 8; i++) {
		data.list.push({
			columns : []
		});
		for (var j = 0; j < 8; j++) {
			data.list[i].columns.push({
				position:i+','+j,
				color : function(dom) {
					var p = dom._anchor.replace(/(\.list\.)|(\.columns)/g, '').split('.');
					p[0] = parseInt(p[0]);
					p[1] = parseInt(p[1]);
					if ((p[0] + p[1]) % 2) {
						return 'grey';
					}
					return 'white';
				},
				value:function(dom){
					var p = dom._anchor.replace(/(\.list\.)|(\.columns)/g, '').split('.');
					p[0] = parseInt(p[0]);
					p[1] = parseInt(p[1]);
					return p[0]*8+p[1]+1
				}
			});
		}
	};

	dataView.fillData(data);

//	dataView.insertData('.list', {
//		columns : [{
//			value : 'b11'
//		}, {
//			value : 'b22'
//		}, {
//			value : 'b33'
//		}, {
//			value : 'b44'
//		}]
//	}, 2);
//	
//	dataView.removeData('.list.2');
	
	dataView.setValue('.list.2.columns.2','value','aaa');
//	
//	console.log($('#table [ij=4,3]')[0]);
//	
//	console.log(util.formatDate(new Date,'YYYY-MM-dd hh:mm:ss:SS'));
	
	
	console.log(common.typeOf(document.createElement('form')));
	

});
