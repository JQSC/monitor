const Router = require('koa-router');
const fs = require("fs")
const sourceMap = require('source-map');
const path = require('path')
const _ = require("lodash")

const router = new Router();

const errorlist = {
    colno: 16562,
    eventId: "385554365100A",
    id: "1638354566471@5AMbJ54e",
    lineno: 36,
    message: "Uncaught ReferenceError: a is not defined",
    stack: "ReferenceError: a is not defined\n    at onClick (http://127.0.0.1:5500/ng-cms/public/bundle/js/44.a24dba494046e3553d3b.js:1:2115)\n    at Q (http://127.0.0.1:5500/ng-cms/public/bundle/js/antd.5a6ff94366a624ff95de.js:1:20259)\n    at Object.s (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:457)\n    at p (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:600)\n    at http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:746\n    at m (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:832)\n    at ae (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16360)\n    at ie (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16170)\n    at se (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:16526)\n    at pe (http://127.0.0.1:5500/ng-cms/public/bundle/js/vendors.0dc53000930271f8787d.js:36:17733)",
    time: 1638354566474,
    type: "ReferenceError",
    url: "http://127.0.0.1:5500/ng-cms/public/bundle/js/44.0dc53000930271f8787d.js",
    user: {},
    time: 1638253532574
}


router.get('/error/list', (ctx) => {
    const filePath = path.join(__dirname, '../public/44.a24dba494046e3553d3b.js.map');
    fs.readFile(filePath, 'utf8', (err, data) => {
        err && console.log("getSourceMapObjByUrl error", err);
        new sourceMap.SourceMapConsumer(JSON.parse(data)).then((sourceMapObj) => {
            const b=getRealStack(sourceMapObj, errorlist.stack);
            console.log('errorlist', b);
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