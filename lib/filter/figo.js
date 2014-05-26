/**
 * js文件的figo支持
 * 解决盖娅环境中，替换js文件中的
 * FE.test={},FD.test={},lofty.test={}
 * dongming.jidm
 */

var Path = require('path'),
	fs = require('fs'),
	utils = require('../utils'),
    iconv = require('iconv-lite');


module.exports = function(req, res, next) {
    var figoConfigPath = req.config.figoPath;

    if(!figoConfigPath) {
        return next();
    }

    var configsContent = getTestConfigContent(figoConfigPath);

    if(!configsContent) {
        return next();
    }

	utils.filter(req, res, next, 'js', function(data) {
        var info = utils.decodeBuffer(data);

        if(!info) {
           return next(new Error('detect file charset failed'));
        }

        var content = info[0];
        var encode = info[1];

        replace(req, res, next, content, configsContent, encode);
	});

};

function replace(req, res, next, data, replaceto, encoding) {
    var fetest = 'FE.test={' + replaceto + '}';
    var fdtest = 'FD.test={' + replaceto + '}';
    var loftytest = 'lofty.test={' + replaceto + '}';

    var content = data.replace(/FE.test=\{.*?\}/g, fetest);

    content = content.replace(/FD.test=\{.*?\}/g, fdtest);
    content = content.replace(/lofty.test=\{.*?\}/g, loftytest);

    var buf = iconv.encode(content, encoding);

    utils.outputResponse(res, 'text/javascript', buf);
}
/**
 * 获取配置文件的内容
 * @param filepath
 * @returns {*|String|string}
 */
function getTestConfigContent(filepath){
    filepath = Path.resolve(filepath);
    var data = '';

    if(!fs.existsSync(filepath)) {
        return data;
    }

    data = fs.readFileSync(filepath).toString();

    return data;
}
