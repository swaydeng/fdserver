var util = require('util'),
	fs = require('fs'),
	zlib = require('zlib'),
	tar = require('tar');


module.exports = function(path, dir, fn) {
	fs.createReadStream(path)
		.pipe(zlib.createGunzip())
		.pipe(tar.Extract({ path: dir }))
		.on('error', function(e) {
			fn(e);
		})
		.on('end', function() {
			fn();	
		});
}

