/**
 * app对不同类型模板引擎的支持
 */
exports = module.exports = {};


/**
 * JADE
 * @param {string} tpl
 * @param {object} params
 * @params {object} options
 *	- path
 *	- config
 *
 * @param {function(e, html)}
 */
exports.jade = function(tpl, params, options, fn) {
	var jade = require('jade').compile(tpl, {
		filename: options.path,
		pretty: options.config.debug
	});

	var html = jade(params);
	fn(null, html);
};


exports.ejs = function(tpl, params, options, fn) {
	var ejs = require('ejs').compile(tpl, {
		filename: options.path
	});
	
	var html = ejs(params);
	fn(null, html);
};


/**
 * html不处理
 */
exports.html = function(tpl, params, options, fn) {
	fn(null, tpl);
};
