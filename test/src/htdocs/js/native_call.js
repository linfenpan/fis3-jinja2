var ua = navigator.userAgent.toLowerCase();
var is_iphone = ua.match(/iphone/i) == "iphone";

function WebViewBridgeReady(cb) {
  if (window.WebViewBridge) {
		cb(window.WebViewBridge);
  } else {
  	document.addEventListener('WebViewBridge', function(){
			document.removeEventListener('WebViewBridge', handler, false);
			cb(window.WebViewBridge);
		}, false);
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

WebViewBridgeReady(function(WebViewBridge) {
	WebViewBridge.onMessage = function(message){
		eval(message);
	};
});

function native_call(method, params_dict){
	if (getParameterByName('from_react') == '1') {
		WebViewBridgeReady(function (WebViewBridge) {
		  var msg = {method: method, params: params_dict};
		  WebViewBridge.send(JSON.stringify(msg));
		});
	} else {
		url = '/native_call/' + method;
		if (params_dict != undefined) {
			var qs = '';
			for(var k in params_dict){
				var v = params_dict[k];
				if(typeof v == 'number' || typeof v == 'boolean')
					v = '' + v;
				else if(typeof v == 'object')
					v = JSON.stringify(v);
				qs += k + '=' + encodeURIComponent(v) + '&';
			}
			if(qs.length)
				//url += '?' + qs;
				url += '?' + encodeURIComponent(JSON.stringify(params_dict));
		}

		if(is_iphone) {
			window.location = url;
		} else if (window.Android) {
			window.Android.loadMethod(method, JSON.stringify(params_dict));
		} else {
			console.info(method, params_dict);
		}
	}
}
