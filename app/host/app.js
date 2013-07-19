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
		windows: 'c:/windows/system32/drivers/etc/hosts'
	};

	var os = require('os');
	return map[os.platform()];
}


function writeHosts(hosts, fn) {
	var path = getHostPath(),
		body = [];

	hosts.forEach(function(host) {
		if (host.enabled) {
			body.push('##' + host.name);
			body.push(host.body);
		}
	});

	body = body.join('\n');
	
	fs.writeFile(path, body, fn);
}
