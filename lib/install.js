var util = require('util'),
	Path = require('path'),
	fs = require('fs'),
	exec = require('child_process').exec;


module.exports = {

	start: function(fn) {
		var self = this;

		if (this.isDevelop()) {
			return fn();
		}

		this.hasGit(function(has) {
			if (!has) {
				return fn();
			}

			self.getRemoteVersion(function(e, version) {
				if (e) {
					return fn();
				}

				if (self.compareVersion(now, version) >= 0) {
					return fn();
				}

				self.install(fn);
			});
		});
	},


	isDevelop: function() {
		var path = Path.join(__dirname, '../.git/HEAD');
		if (!fs.existsSync(path)) {
			return false;
		}
		
		var body = fs.readFileSync(path, 'utf-8'),
			info = this.parseInfo(body);
		
		return info.ref !== 'refs/heads/master';
	},


	parseInfo: function(body) {
		var o = {},
			lines = body.split(/\n+/);
		lines.forEach(function(line) {
			var parts = line.split(/:/);	
			o[parts[0].trim()] = parts.slice(1).join(':').trim();
		});
		return o;
	},


	hasGit: function(fn) {
		exec('git', function(e) {
			return fn(!e);
		});
	},


	getLocalVersion: function() {
		var path = Path.join(__dirname, '../package.json');
		try {
			var info = fs.readFileSync(path, 'utf-8');
			info = JSON.parse(info);
			return info.version;
		} catch(e) {
			return null;
		}
	},


	getRemoteVersion: function(fn) {
		var url = 'https://github.com/fangdeng/fdserver/blob/master/package.json';
		utils.getUrlsContent(url, function(e, data) {
			if (e) {
				return fn(e);
			}

			var info = JSON.parse(data.toString());
			fn(null, info.version);
		});
	},


	compareVersion: function(left, right) {
		left = left.split(/\D/),
		right = right.split(/\D/);
		var c = Math.max(left.length, right.length);
		for (var i = 0; i < c; i++) {
			var a = parseInt(left[i]) || 0,
				b = parseInt(right[i]) || 0;
			if (a !== b) {
				return a < b ? -1 : 1;
			}
		}

		return 0;
	},


	install: function(fn) {
		exec('git pull', function(e) {
			if (e) {
				return fn();
			}

			exec('npm install', function(e) {
				fn();	
			});
		});
	}

};

