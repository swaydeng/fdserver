/**
 *  host管理
 */
var fs = require('fs'),
	util = require('util'),
	utils = require('../../lib/utils');


exports.index = function() {
	var self = this;
	this.data.read('hosts', function(e, hosts) {
		hosts = hosts || getDefaultHosts();
		self.render({
			hosts: hosts	
		});
	});
};


exports.item = function() {
	var host = {
		name: '新建Host',
		enabled: true,
		body: ''
	};

	this.render({ host: host });
};


exports.update = function() {
	var self = this,
		hosts = JSON.parse(this.req.body.hosts);

	var out = function(success, message) {
		self.render({ success: success, message: message });
	};

	this.data.write('hosts', hosts, function(e) {
		if (e) {
			return out(false, e.toString());
		}

		writeHosts(hosts, function(e) {
			if (e) {
				return out(false, e.toString());
			}

			out(true);
		});
	});

};


function getDefaultHosts() {
	return [{
		name: '系统默认',
		enabled: true,
		body: getHostBody()
	}]
}


function getHostBody() {
	var path = getHostPath();
	try {
		var body = fs.readFileSync(path),
			ret = utils.decodeBuffer(body);
		return ret ? ret[0] : '';
	} catch (e) {
		util.error(e);
		return '';
	}
}


function getHostPath() {
	var map = {
		linux: '/etc/hosts',
		darwin: '/etc/hosts',
		win32: 'c:/windows/system32/drivers/etc/hosts'
	};

	var os = require('os'),
		path = map[os.platform()];
	return path && fs.existsSync(path) ? path : false;
}


function writeHosts(hosts, fn) {
	hosts = hosts.slice(0).sort(function(left, right) {
		return left.order - right.order;
	});

	var map = {};

	hosts.forEach(function(host) {
		if (!host.enabled) {
			return;
		}

		var pattern = /\s*(\d+\.\d+\.\d+\.\d+)\s+(.+)$/,
			lines = host.body.split(/\r\n|\n|\r/);

		lines.forEach(function(line) {
			line = line.replace(/@[-\w]+/, '')
			line = line.replace(/#.*$/);
			var match = pattern.exec(line);
			if (match) {
				var domains = match[2].split(/\s+/);
				domains.forEach(function(domain) {
					map[domain]	= match[1];
				});
			}
		});
	});

	var body = [];
	for (var k in map) {
		body.push(map[k] + ' ' + k);
	}
	body = body.join('\n');

	var path = getHostPath();
	if (path) {
		fs.writeFile(path, body, fn);
	} else {
		util.error('unkonw host path');
	}
	

}
