const Router = require('koa-router');
const fs = require("fs")
const sourceMap = require('source-map');
const path = require('path')
const _ = require("lodash")

const router = new Router();

const errorlist = {
    colno: 1590,
    eventId: "86495031041B",
    id: "1638348945131@6FmXy725",
    lineno: 52,
    message: "Uncaught Error: Loading CSS chunk 40 failed.\n(/ng-cms/public/bundle/static/css/40.23a039f3.chunk.css)",
    stack: "Error: Loading CSS chunk 40 failed.\n(/ng-cms/public/bundle/static/css/40.23a039f3.chunk.css)\n    at HTMLLinkElement.r.<computed>.r.<computed>.<computed>.a.push.r.<computed>.l.onerror (http://127.0.0.1:5500/public/bundle/js/manifest.6fcc9aa06e2bc37663d1.js:1:2034)",
    time: 1638348945132,
    type: "Error",
    url: "http://localhost:3000/vendors.0dc53000930271f8787d.js",
    user: {},
    time: 1638253532574
}


router.get('/error/list', (ctx) => {
    const filePath = path.join(__dirname, '../public/vendors.0dc53000930271f8787d.js.map');
    fs.readFile(filePath, 'utf8', (err, data) => {
        err && console.log("getSourceMapObjByUrl error", err);
        new sourceMap.SourceMapConsumer(JSON.parse(data)).then((sourceMapObj) => {
            getRealStack(sourceMapObj, errorlist.stack);
            console.log('errorlist', errorlist.stack);
        })

    })


    ctx.response.status = 200
    ctx.body = { state: 200, type: 'success' }
})





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

module.exports = router;