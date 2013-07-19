/**
 * 简单数据持久化模块
 */

var fs = require('fs'),
	Path = require('path');


exports = module.exports = function(o) {
	this.root = o.root;
	this.app = o.name;
};


exports.prototype.read = function(name, fn) {
	var path = this._getDataPath(name);

	fs.exists(path, function(exists) {
		if (!exists) {
			return fn(null, null);
		}

		fs.readFile(path, function(err, body) {
			var data = null;
			if (!err) {
				try {
					data = JSON.parse(body.toString());
				} catch (e) {
					err = e;
				}
			}

			fn(err, data);
		});
	});
};


exports.prototype.write = function(name, value, fn) {
	var path = this._getDataPath(name),
		dir = Path.dirname(path);

	if (!fs.existsSync(dir)) {
		var mkdirp = require('mkdirp');
		mkdirp.sync(dir);
	}

	value = JSON.stringify(value);
	fs.writeFile(path, value, fn);
};


exports.prototype._getDataPath = function(name) {
	return Path.join(this.root, '.data', name + '.json');
};
