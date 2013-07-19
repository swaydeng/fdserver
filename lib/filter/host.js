/**
 * 基于host资源访问的基本功能
 */

var Path = require('path'),
	mime = require('mime'),
	connect = require('connect'),
	utils = require('../utils');


/**
 * Options:
 *	`root`	根目录
 */
module.exports = function(req, res, next) {
	var config = req.config;
	config.root ? 
		process(req, res, next, config) :
		next();
};


function process(req, res, next, config) {
	req.filepath = Path.join(config.root, req.url.replace(/\?.*$/, ''));
	req.fileext = Path.extname(req.filepath);

	if (req.fileext === '.htm' || req.fileext === '.html') {
		// 如果没有设置Content-Type, static会设置Content-Type为text/html utf-8
		// 这在gbk等编码的html文件不能正常工作
		// 所以这里自己设置一下
		res.setHeader('Content-Type', 'text/html');
	}

	res.setHeader('File-Path', req.filepath);

	var app = connect()
		.use(connect.directory(config.root))
		.use(connect.static(config.root));

	app(req, res, next);
}

