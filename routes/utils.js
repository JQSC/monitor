const sourceMap = require('source-map');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * 
 * @param {*} url 发生错误的url,最后切割的是文件名,配上注册时数据库的url即可
 * @param {*} line 行
 * @param {*} column 列
 */
async function analyzeError(url, line, column) {
    if (_.isEmpty(url) || line === '0' || column === '0') {
        return;
    }
    // map数据源
    const mapSource = await getMapSource(url);
    // 判断是否为空
    if (_.isEmpty(mapSource)) {
        // 直接return
        return mapSource;
    }
    // 2.解析
    const mapResult = await mapReduction(mapSource, line, column)
    return mapResult;
}

// 获取map数据
async function getMapSource(url) {
    // 1.获取url对应的map地址
    const jsName = _.split(url, '/');
    // 获取map名称
    const tmp = jsName[jsName.length - 1] + '.map';
    const mapUrl = '../maps/' + tmp;
    // map文件
    // const mapSource = await this.ctx.curl(mapUrl, {
    //   timeout: 3000,
    // });
    const filePath = path.join(__dirname, mapUrl);
    const mapSource = JSON.parse(fs.readFileSync(filePath).toString())
    return mapSource;
}

// map还原
async function mapReduction(mapSource, line, column) {
    const sourcesPathMap = {};
    const fileContent = JSON.stringify(mapSource);
    const fileObj = mapSource;
    const sources = fileObj.sources;
    // eslint-disable-next-line array-callback-return
    sources.map(item => {
        sourcesPathMap[fixPath(item)] = item;
    });
    // 解析
    const consumer = await new sourceMap.SourceMapConsumer(fileContent);
    const lookup = {
        line: parseInt(line),
        column: parseInt(column),
    };
    const result = consumer.originalPositionFor(lookup);
    // 错误源码输出
    // const originSource = sourcesPathMap[result.source];
    // const sourcesContent = fileObj.sourcesContent[sources.indexOf(originSource)];
    // result.sourcesContent = sourcesContent;
    consumer.destroy();
    return result;
}

function fixPath(filepath) {
    return filepath.replace(/\.[\.\/]+/g, '');
}


const errorlist = {
    colno: 16562,
    eventId: "385554365100A",
    id: "1638354566471@5AMbJ54e",
    lineno: 36,
    message: "Uncaught ReferenceError: a is not defined",
    stack: "ReferenceError: a is not defined\n    at onClick (http://127.0.0.1:5500/ng-cms/public/bundle/js/44.a24dba494046e3553d3b.js:1:2115)\n    at Q (http://127.0.0.1:5500/ng-cms/public/bundle/js/antd.5a6ff94366a624ff95de.js:1:20259)\n    at Object.s (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:457)\n    at p (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:600)\n    at http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:746\n    at m (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:832)\n    at ae (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16360)\n    at ie (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16170)\n    at se (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16526)\n    at pe (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:17733)",
    time: 1638431194532,
    type: "ReferenceError",
    url: "http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js",
    user: {},
    time: 1638253532574
}

const { url, lineno, colno } = errorlist

let result = analyzeError(url, lineno, colno);

result.then((res) => {
    console.log('res', res)
})




module.exports = {
    analyzeError
}