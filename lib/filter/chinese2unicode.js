/**
 * chinese2unicode
 * 作者：shiwei.dengsw
 * 描述：动态地将被请求的 js 文件中的中文转成 unicode 形式。
 * 使用说明：如需要转 unicode ，只需要在对应的 rewrite 规则里
 * 增加一个 chinese2unicode 字段、并设置为 true 即可，形如：
 *
 * { 
 *     from: /^\/m\/huopin\/(.*)$/, 
 *     to: '$1', 
 *     chinese2unicode: true 
 * }
 *
 */

var Path = require('path');
var utils = require('../utils');
var iconv = require('iconv-lite');

module.exports = function (req, res, next) {     

    if (!shouldConvert(req)) {
        return next();
    } 

    utils.filter(req, res, next, 'js', function (data) {
        process(req, res, next, data);
    });

};

function process (req, res, next, data) {
    var info = utils.decodeBuffer(data);
    var text = info[0];
    var encoding = info[1];
    
    var buf = iconv.encode(toUnicode(text), encoding);
    // utils.outputResponse(res, 'application/x-javascript', buf);
    utils.outputResponse(res, 'text/javascript', buf);
}

function shouldConvert (req) {
    var rule, regex;
    var rules = req.config.rewrite;

    if (!Array.isArray(rules)) {
        return false;
    }      

    for (var i = 0, len = rules.length; i < len; i ++) {
        rule = rules[i];
        regex = typeof rule.from === 'string' ? new RegExp(rule.from) : rule.from;
        if (rule.chinese2unicode && regex.test(req.url)) {
            return true;
        }
    }

    return false;
}

function toUnicode (s) { 
    return s.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g, function () {
        return '\\u' + RegExp['$1'].charCodeAt(0).toString(16);
    });
}