var util = require('util'),
	Path = require('path'),
	fs = require('fs'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,

	utils = require('./utils');


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
			self.shouldInstall(function(should) {
				if (should) {
					self.install(fn);
				} else {
					fn();
				}
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
		exec('git --version', function(e) {
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
		var url = 'https://raw.github.com/fangdeng/fdserver/master/package.json';

		utils.getUrlContent(url, function(e, data) {
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


	shouldInstall: function(fn) {
		var self = this,
			path = Path.join(__dirname, '../node_modules');

		fs.exists(path, function(exists) {
			if (!exists) {
				return fn(true);
			}

			self.getRemoteVersion(function(e, remote) {
				if (e) {
					return fn(false);
				}

				var local = self.getLocalVersion();
				if (local && remote &&
						self.compareVersion(local, remote) < 0) {
					
					util.log('latest version is: ' + remote);

					return fn(true);
				}

				return fn(false);
			});
		});
	},


	install: function(fn) {
		var path = Path.normalize(Path.join(__dirname, '../'));
		process.chdir(path);

		util.log('install...');

		var gitpull = spawn('git', ['pull'], { stdio: 'inherit' });
		gitpull.on('error', fn);
		gitpull.on('close', function() {
			var install = spawn('npm', ['install'], { stdio: 'inherit' });
			install.on('error', fn);
			install.on('close', fn);
		});
	}

};

