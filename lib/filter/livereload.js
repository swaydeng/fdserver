/**
 * @author chunterg
 * @description 实时刷新中间件，增加监控脚本
 */
var iconv = require('iconv-lite'),
	utils = require('../utils');
var LIVERELOAD_PORT = 35729;
module.exports = function(req, res, next) {
	utils.filter(req, res, next, ['html','htm'], function(data) {
		var info = utils.decodeBuffer(data),
			text = info[0],
			encoding = info[1];
			var src = "' + (location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':" + LIVERELOAD_PORT + "/livereload.js?snipver=1";
				var snippet = "\n<script type=\"text/javascript\">document.write('<script src=\"" + src + "\" type=\"text/javascript\"><\\/script>')</script>\n";
				text = text.replace(/<\/body>/, function(w) {
					return snippet + w;
				});
			buf = iconv.encode(text, encoding);
			
		utils.outputResponse(res, 'text/html', buf);
	});
};