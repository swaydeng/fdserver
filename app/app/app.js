/**
 * app开发
 */

var util = require('util'),
	fs = require('fs'),
	Path = require('path'),
	utils = require('../../lib/utils');


exports.index = function() {
	var self = this;

	this.data.read('info', function(e, info) {
		info = info || {
			remote: '',
			path: ''
		};

		watch(self.req, info);

		self.render({ info: info });
	});

};


exports.update = function() {
	var self = this,
		info = JSON.parse(this.req.body.info);
	
	this.data.write('info', info, function(e) {
		var o = { success: true }
		if (e) {
			o = { success: false }
		}
		self.render(o)
	});
};


exports.message = function() {
	var msgs = this.req.session.messages;
	delete this.req.session.messages;
	this.render({
		success: true,
		data: msgs || []
	});
};


function watch(req, info) {
	var stat = fs.statSync(info.path);
	if (!stat.isDirectory()) {
		message(req, 'sitedata路径不存在: ' + info.path, 'error');
	}

	message(req, '监听目录: ' + info.path);
	watchDir(info.path, function(event, path) {
		var ext = Path.extname(path);
		if (/\.[a-z]+$/.test(ext)) {
			fileChange(req, info, path);
		}
	});

}


function fileChange(req, info, path) {
	message(req, path + ' updated');
}


function watchDir(path, watcher) {
	util.debug('watch dir: ' + path);

	fs.watch(path, { persistent: false }, function(event, filename) {
		watcher(event, Path.join(path, filename));
	});

	fs.readdir(path, function(err, files) {
		if (err) {
			return;
		}

		files.forEach(function(file) {
			var childPath = Path.join(path, file);
			fs.stat(childPath, function(e, stat) {
				if (!e && stat.isDirectory()) {
					watchDir(childPath, watcher);
				}
			});
		});

	});
}


function message(req, msg, type) {
	var o = { type: type || 'info', message: msg };
	o.time = new Date().getTime();

	util.debug(utils.format('[{type}] {message}', o));
	
	var msgs = req.session.messages || [];
	msgs.push(o);
	req.session.messages = msgs;
}
