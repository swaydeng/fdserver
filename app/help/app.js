var fs = require('fs'),
	Path = require('path');


exports.index = function() {
	var next = this.next,
		res = this.res,
		path = Path.normalize(Path.join(__dirname, '../../README.md'));

	fs.readFile(path, function(e, body) {
		if (e) {
			return next(e);
		}

		var markdown = require('markdown').markdown,
			html = markdown.toHTML(body.toString());

		res.setHeader('Content-Type', 'text/html');
		res.end(html);
	});
};
