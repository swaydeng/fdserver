/**
 * 资源延迟访问
 */

module.exports = function(req, res, next) {
	var delay = req.query.delay && parseFloat(req.query.delay);
	if (!delay) {
		return next();
	}

	var end = res.end;
	res.end = function() {
		var args = arguments;
		setTimeout(function() {
			end.apply(res, args);
		}, delay * 1000);
	};

	next();
};


