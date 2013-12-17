/**
 * 提供app的支持
 */

var util = require('util'),
	fs = require('fs'),
	Path = require('path'),
	connect = require('connect'),
	utils = require('../utils');


exports = module.exports = connect();
exports.use(connect.cookieParser())
		.use(connect.urlencoded())
		.use(connect.json())
		.use(connect.session({ 
			secret: 'fdserver app session', 
			key: 'fdserver_session_id', 
			cookie: { secure: true }}
		));


exports.use(function(req, res, next) {
	var root = req.config.appRoot;
	if (!root) {
		return next();
	}
	
	req.config.root = root;

	var path = Path.join(root, req.url);
	fs.stat(path, function(e, stat) {
		if (stat && stat.isFile()) {
			util.debug('resource exist: ' + path);
			return next();
		}

		process(req, res, next, root);
	});
});


function process(req, res, next, root) {
	var o = route(req.url);

	util.debug(utils.format('route to {name}.{action}({params}), type: {type}', {
		name: o.name,
		action: o.action,
		params: o.params.join(', '),
		type: o.type
	}));

	root = Path.join(root, o.name);
	var cPath = Path.join(root, 'app.js');
	fs.exists(cPath, function(exists) {
		if (!exists)	{
			util.debug('control not exist: ' + o.name);
			return next();
		}

		utils.extend(o, {
			req: req,
			res: res,
			next: next,

			root: root
		});

		var controller = require(cPath);
		run(o, controller);
	});

}


function route(path) {
	path = path.replace(/\?.*$/, '');

	var type = Path.extname(path).slice(1) || 'html';
	path = path.replace(/\.[^.]*$/, '');

	var match = /\/([a-zA-Z][-\w]+)(\/([a-zA-Z][-\w]+))?(\/(.*))?/.exec(path) || [];
	return {
		name: match[1] || 'default',
		action: match[3] || 'index',
		params: (match[5] || '').split('/'),
		type: type
	};
}


function run(o, controller) {
	var action = controller[o.action];
	if (!action) {
		return o.next();
	}

	o.render = function(view, params) {
		if (typeof view !== 'string') {
			params = view || {};
			view = o.action;
		}

		util.debug('render view: ' + view + ', type: ' + o.type);

		if (o.type === 'json' || o.type === 'jsonp') {
			renderJson(o, params);
		} else {
			renderTpl(o, controller, view, params);
		}
	};

	util.debug(utils.format('call action: {name}.{action}({params})', {
		name: o.name,
		action: o.action,
		params: o.params
	}));

	mixService(o);
	action.apply(o, o.params);
}


function renderJson(o, params) {
	var output = JSON.stringify(params),
		type = 'text/json';

	if (o.type === 'jsonp') {
		output = '' + (o.req.query.callback || '') + '(' + output + ')';
		type = 'text/javascript';
	}
	
	var charset = o.req.query.output_charset;
	if (charset) {
		output = require('iconv-lite').encode(output, charset);
	}

	utils.outputResponse(o.res, type, output);
}


function renderTpl(o, controller, view, params) {
	var pair = guessView(o, view);
	if (!pair) {
		var msg = 'no template or engine found for:' + view;
		util.error(msg);
		return o.next(new Error(msg));
	}

	var path = pair[0],
		engine = pair[1];

	fs.readFile(path, function(e, body) {
		var tpl = body.toString();	
		if (e) {
			util.error(e.toString());
			return o.next(e);
		}

		params = utils.extend({}, o, params);

		var options = {
			path: path,
			config: o.req.config
		};

		engine(tpl, params, options, function(e, html) {
			if (e) {
				util.error(e.toString());
				return next(e);
			}

			utils.outputResponse(o.res, 'text/html', html);
		});
	});
}


function mixService(o) {
	var Data = require('./app/data');
	o.data = new Data(o);
}


function guessView(o, view) {
	var View = require('./app/view');
	for (var type in View) {
		var path = Path.join(o.root, 'view', view + '.' + type);
		if (fs.existsSync(path)) {
			return [path, View[type]];
		}
	}
}
