const fs = require("fs")
const sourceMap = require('source-map');
const _ = require("lodash")
var LruCache = require("lru-cache")
const request = require("request")
const path = require('path')
const sourceMapPath = './dist'
let sourceMapCache = new LruCache(20);


function getFileNameByUrl(url) {
    return url.replace(/[^a-z0-9.]+|\./gi, "_") + '.map'
}

function getSourceMapObjByUrl(url) {
    return new Promise((resolve) => {
        request(url, function (error, response, body) {
            let fileName = getFileNameByUrl(url);
            let filePath = path.join(__dirname, sourceMapPath, fileName);
            console.log('filePath',filePath);
           // console.log('body:', body); // Print the HTML for the Google homepage.
            try {
                let fileContent = body; //JSON.stringify(body);
                fs.writeFile(filePath, fileContent, (err) => {
                    err && console.log("getSourceMapObjByUrl error", err)
                });
            } catch (err) {
                console.log("getSourceMapObjByUrl JSON stringify error", err)
            }

            resolve(new sourceMap.SourceMapConsumer(JSON.parse(body)))
        });
    })
}

function getRealStackLine(sourceMapObj, stackLine) {
    // 期望格式: filepath:line:column
    let stackLineBlockArr = stackLine.split(":");

    // 符合期望格式
    if (stackLineBlockArr.length >= 3 && _.isNumber(Number(stackLineBlockArr[1])) && _.isNumber(Number(stackLineBlockArr[2]))) {
        let { source, line, column, name } = sourceMapObj.originalPositionFor({
            line: Number(stackLineBlockArr[1]),
            column: Number(stackLineBlockArr[2])
        });

        if (source && line && column) {
            return [source, name, line, column].join(":")
        } else {
            return stackLine;
        }
    } else {
        return stackLine;
    }
}

function getRealStack(sourceMapObj, stack) {
    let stackArr = stack.split("\n");
    return stackArr.map(stackLine => getRealStackLine(sourceMapObj, stackLine)).join("\n");
}

function errorStackParser(url, log) {
    let fileName = getFileNameByUrl(url);
    let sourceMapObj = sourceMapCache.get(fileName);

    return new Promise(resolve => {
        // 如果缓存存在
        if (sourceMapObj) {
            resolve(sourceMapObj);
            // 如果只能从url获取
        } else {
            resolve(getSourceMapObjByUrl(url))
        }
    }).then((sourceMapObj) => {
        // 更新缓存
        sourceMapCache.set(fileName, sourceMapObj)
        // 更新错误栈
        log.stack = getRealStack(sourceMapObj, log.stack);
        return log;
    }).catch(err => {
        // 如果发生错误，则返回原本的log日志，保证日志记录无误
        console.log("errorStackParser error", err);
        return log;
    })
}

module.exports = errorStackParser;