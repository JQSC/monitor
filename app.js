const Koa = require('koa');
const cors = require('koa2-cors');
const BodyParser = require('koa-bodyparser')
const errorReport = require('./routes/errorReport')
const errorList = require('./routes/errorList')
const static = require('koa-static')
const path = require('path')

const app = new Koa();

//处理跨域
app.use(cors({
    origin: '*',
    credentials: true,
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH']
}))

// 配置路径
app.use(static(path.join(__dirname, './public')))

app.use(new BodyParser());

app.on('error', err => {
    console.log('server error', err)
});


app
    .use(errorReport.routes())
    .use(errorList.routes())
    .use(errorReport.allowedMethods());


app.listen(3000);






