var app = {};

var cache = {};

app.utils = {

	schedule: function(name, fn, delay) {
		delay = delay || 1000;	
		var timer = cache[name];
		timer && clearTimeout(timer);
		cache[name] = setTimeout(function() {
			delete cache[name];
			fn();
		}, delay);
	}


};
