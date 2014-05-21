/**
 * markdown支持
 */

var Path = require('path'),
	fs = require('fs'),
	utils = require('../utils');


module.exports = function(req, res, next) {
	utils.filter(req, res, next, 'md', function(data) {
		var text = new Buffer(data).toString();
		var marked = require('marked');

		marked(text, getOptions(), function(err, body) {
			if (err) {
				return next(err);
			}
			render(req, res, next, body);
		});
	});

};


function getOptions() {
	return {
		gfm: true,
		tables: true,
		breaks: false,
		pedantic: false,
		sanitize: true,
		smartLists: true,
		smartypants: false,
		langPrefix: 'prettyprint lang-'
	};
}


function render(req, res, next, body) {
	var jade = require('jade'),
		path = Path.join(__dirname, 'markdown/template.jade');

	fs.readFile(path, function(e, tpl) {
		if (e) {
			return next(e);
		}

		var fn = jade.compile(tpl.toString(), {
			pretty: true	
		});

		var assets = 'http://127.0.0.1';
		if (req.config.port && ('' + req.config.port) !== '80') {
			assets += ':' + req.config.port;
		}
		assets += '/assets'

		var html = fn({
			assets: assets,
			title: getTitle(body),
			body: body
		});

		utils.outputResponse(res, 'text/html', html);
	});

}


function getTitle(body) {
	return (/<h1>(.*?)<\/h1>/.exec(body) || [])[1] || '';
}
