/**
 * less支持
 */

var Path = require('path'),
	fs = require('fs'),
	util = require('util'),
	utils = require('../utils'),
	iconv = require('iconv-lite');


var ERROR_TPL =  
[
'body:before {',
'	content: \'{0}\';',
'	font-size: 40px;',
'	color: #f00;',
'}'
].join('');


module.exports = function(req, res, next) {
	var root = req.config.root,
		path = req.url.replace(/\?.*$/, '');
	if (root && Path.extname(path) === '.css') {
		path = Path.join(Path.dirname(path), Path.basename(path, '.css') + '.less');
		var absPath = Path.join(root, path);
		if (fs.existsSync(absPath)) {
			util.debug('less file exist, use less file: ' + path);
			process(req, res, next, absPath);
			return;
		}
	}
	next();
};


function process(req, res, next, path) {
	fs.readFile(path, function(e, data) {
		if (e) {
			return next(e);
		}
		processLess(req, res, next, data);
	});
}


function processLess(req, res, next, data) {
	var info = utils.decodeBuffer(data),
		less = info[0],
		encoding = info[1];

    if(ignore(less)) {
        // 如果此less文件有不编译标识
        utils.outputResponse(res, 'text/less', less);
        return;
    }

	parse(less, req, function(css) {
		var buf = iconv.encode(css, encoding);
		utils.outputResponse(res, 'text/css', buf);
		tryOutput(req, buf);
	});
}


function parse(less, req, fn) {
		opts = getOptions(req),
		Parser = require('less').Parser,
		parser = new Parser(opts);

	parser.parse(less, function(ex, tree) {
		var css = '';
		if (!ex) {
			try {
				css = tree.toCSS();
			} catch (e) {
				ex = e;
			}
		}

		if (ex) {
			util.error(ex.message);
			css = getErrorOutput(ex, req);
		}

		fn(css);
	});
}


function getOptions(req) {
	var root = req.config.root || '.',
		dir = Path.dirname(req.filepath);

	return utils.extend({
		paths: [dir, root],
		filename: req.filepath
	}, req.config.less);

}

function ignore(source) {
    var sIgnore = '/*!!cmd:lessbuild=false*/';

    if (source.indexOf(sIgnore) !== -1) {
        return true;
    }

    return false;
}

function tryOutput(req, buf) {
	var path = req.filepath;
	if (!path) {
		return;
	}

	path = Path.join(Path.dirname(path), 
			Path.basename(path, '.less') + '.css');
	
	fs.exists(path, function(exists) {
		if (!exists) {
			return;
		}

		util.debug('write css file: ' + path);
		fs.writeFile(path, buf, function(e) {
			e && util.error(e);
		});

	});
}

function getErrorOutput(ex, req) {
	var css = 'Less Compile Error!!!:\n\n' + JSON.stringify(ex);
	return utils.format(ERROR_TPL, [css.replace(/'/g, '').replace(/\s/g, ' ')]);
}

/**
 * 解决less import中文件编码非utf-8问题
 */
(function fix() {
	var importer = require('less').Parser.importer;

	var readFile = fs.readFile;
	fs.readFile = function(pathname, encoding, fn) {
		if (arguments.callee.caller === importer) {
			readFile.call(this, pathname, function(e, data) {
				if (e) {
					return fn(e);
				}

				var o = utils.decodeBuffer(data);
				if (!o) {
					return fn(new Error('decode error'));
				}

				fn(null, o[0]);
			});
		} else {
			return readFile.apply(this, arguments);
		}
	};

})();
