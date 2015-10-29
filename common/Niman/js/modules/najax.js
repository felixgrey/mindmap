define(function(require, exports, module) {
	//UUID
	var createId = function(prefix) {
		prefix = prefix || '';
		//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/873856#873856
		var s = [], hexDigits = "0123456789ABCDEF";
		for (var i = 0; i < 32; i += 1) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		return prefix + s.join("");
	}
	//-----------------------Request-------------------------//

	//Request
	var createXMLHttpRequest = function(callback, error) {
		var request = false;
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
			if (request.overrideMimeType) {
				request.overrideMimeType('text/xml');
			}
		} else if (window.ActiveXObject) {
			var versions = ['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.7.0', 'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
			for (var i = 0; i < versions.length; i++) {
				try {
					request = new ActiveXObject(versions[i]);
					if (request) {
						break;
					}
				} catch(e) {
				}
			}
		}
		if (request) {
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					callback(request.responseText);
				}
			};
			return request;
		}
	};

	var parametersToString = function(parameters, encodeURI) {
		var str = "", key, parameter;
		parameters = parameters || {};
		for (key in parameters) {
			if (parameters.hasOwnProperty(key)) {
				key = encodeURI ? encodeURIComponent(key) : key;
				if ('string' != typeof parameters[key]) {
					parameters[key] = JSON.stringify(parameters[key]);
				}
				parameter = encodeURI ? encodeURIComponent(parameters[key]) : parameters[key];
				str += key + "=" + parameter + "&";
			}
		}
		return str.replace(/&$/, "");
	};

	var fullUrl = function(url, paramStr) {
		url = url + '?' + paramStr;
		return url.replace(/\?$/g, '');
	};

	var head = document.getElementsByTagName('head')[0] || document.documentElement;
	var scripts = head.getElementsByTagName('script');

	var getJs = function(url, callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.originSrc = url;
		var cbk = function(evt) {
			callback && callback(script, evt);
		}
		if (/msie [678]/g.test(navigator.userAgent.toLowerCase())) {
			script.onreadystatechange = function() {
				if (script.readyState == 'loaded' || script.readyState == 'complete') {
					script.onreadystatechang = null;
					cbk(window.event);
				}
			};
		} else {
			script.onload = script.onerror = cbk;
		}
		script.src = url;
		head.insertBefore(script, scripts[0]);
	};

	var Void = function() {
	};

	var request = function(param) {
		var request = createXMLHttpRequest(param.success || Void, param.error || Void);
		var url = param.url;
		param.beforeSend&&param.beforeSend(request);
		var parametersStr = parametersToString(param.parameters, true);
		if ('GET' == param.type) {
			request.open('GET', fullUrl(url, parametersStr), param.async);
			request.send(null);
		} else {
			request.open("POST", url, param.async);
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.send(parametersStr);
		}

	};

	//-----------------------JsonP-------------------------//

	var jsonP = function(param) {
		var callbackName = param.callback || createId('jsonP_');
		param.parameters.callback = callbackName;
		var url = fullUrl(param.url, parametersToString(param.parameters, true));
		window[callbackName] = function(json) {
			//IE8及以前版本不支持delete；
			window[callbackName]=null;
			param.success(json);
		};
		var head = document.getElementsByTagName('head')[0] || document.documentElement;
		getJs(url, function(script) {
			head.removeChild(script);
		});
	};

	module.exports = function Ajax(param) {
		if (!param.type) {
			return;
		}
		var type = param.type = param.type.toUpperCase();
		param.parameters = param.parameters || {};
		if ('GET' == type || 'POST' == type) {
			request(param);
		} else if ('JSONP' == type) {
			jsonP(param);
		}
	};
});
