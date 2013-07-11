/**
 * 提供app的支持
 */

var util = require('util'),
	path = require('path');


module.exports = function(req, res, next) {
	var appRoot = req.config.appRoot;
	if (!appRoot) {
		return next();
	}
	
	var root = typeof appRoot === 'string' ? appRoot :
			path.normalize(path.join(__dirname, '../../app'))
	
	process(req, res, next, root)
};


function process(req, res, next, root) {
	var match = /\/([a-zA-Z][-\w]+)\/([a-zA-Z][-\w]+)?/.exec(req.path),
		name = match ? match[1] : 'default',
		action = match && match[2] || 'index';

	util.log('route to ' + name + '.' + action);
	next();
}
