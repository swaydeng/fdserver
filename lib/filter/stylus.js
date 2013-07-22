/**
 * stylus支持
 */

var Path = require('path'),
	iconv = require('iconv-lite'),
	utils = require('../utils');


module.exports = function(req, res, next) {
	utils.filter(req, res, next, 'stylus', function(data) {
		var info = utils.decodeBuffer(data),
			text = info[0],
			encoding = info[1],
			opts = getOptions(req);

		var stylus = require('stylus');

		stylus.render(text, opts, function(e, css) {
			if (e) {
				return next(e);
			}

			var buf = iconv.encode(css, encoding);
			utils.outputResponse(res, 'text/css', buf);
		});

	});
};


function getOptions(req) {
	var root = req.config.root || '.',
		dir = Path.dirname(req.url);

	return utils.extend({
		paths: [Path.join(root, dir), root],
		filename: Path.basename(req.url)
	}, req.config.stylus);
}
