var fs = require('fs'),
	Path = require('path');


exports.index = function() {
	var req = this.req;

	req.config.root = Path.dirname(Path.dirname(__dirname));
	req.url = '/README.md';
	
	// delegate to host filter	
	this.next();
};
