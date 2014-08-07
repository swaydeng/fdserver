/**
 * @author chunterg
 * artemplate模板编译中间件
 * 基于tmodjs
 */
var TmodJS = require('ali-tmodjs');
var utils = require('../utils');
var path = require('path');
module.exports = function(req, res, next) {
	var cfg = req.config.tpl2js || {
		base:req.config.root
	};
	console.log(cfg)
	utils.filter(req, res, next, ['art','tpl'], function(data) {
		try{
			var tmod = new TmodJS(cfg.base || req.config.root,{});
			var tpl = tmod.template.AOTcompile(data.toString(),{
				filename: (tmod.base+req.url).replace(tmod.base + '/', ''),
	            alias: cfg.alias||null,
				type: cfg.type||'fmd',
	            compress: cfg.compress || false,
	            escape: cfg.escape||false,
	            runtime: cfg.runtime||'template.js',
	            debug: cfg.debug||false,
	            resolve:cfg.resolve ||null
			});
			utils.outputResponse(res, 'text/javascript', tpl.code);
		}catch(e){
			console.log(e)
			next();
		}		
	});
};