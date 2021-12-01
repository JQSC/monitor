const Router = require('koa-router');

const router = new Router();

router.post('/error/report', (ctx) => {
    ctx.response.status = 200

    //console.log(ctx.request.body)

    ctx.body = { state: 200, type: 'success' }
})


module.exports = router

