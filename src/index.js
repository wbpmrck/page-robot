const koa = require('koa'),
    path = require('path'),
    views = require('koa-views'),
    static = require('koa-static'),
    config = require('config'),
    serve = require('koa-static');
const session = require('koa-session');

const logger = require('../log/logger');

require("./app/helper/validate-extend"); //这里不能删，通过require实现验证类的注入

var app = module.exports = koa();



/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`Scheduler Caught exception: ${err}`);
});

process.on('SIGHUP', () => {
    console.log('Scheduler Received SIGHUP.');
});


app.on('error', function(err){
    logger.error('Scheduler error %s', err);
});


/* ---------------------------------
 加载中间件
 ---------------------------------*/
// 1.helpers
app.use(require('./app/interceptors/context-extend'));

// 2.bodyparser
app.use(require('koa-bodyparser')());

// 3.日志
app.use(require('./app/interceptors/logger'));

// 4.跨域
app.use(require('./app/interceptors/cross-origin'));
// 5.session middleware
app.keys = ['im a newer secret', 'i like turtle'];
app.use(session(config.session, app));

// 6.登录鉴权
app.use(require('./app/interceptors/auth'));

// 7.orm 中间件
app.use(orm.middleware);

// 8.initialize render helper
app.use(views(config.template.path, config.template.options));


/* ---------------------------------
 注册路由
 ---------------------------------*/
// require('./app/routes').regist(app);
require('./app/routes').auto(app);

// 9.static file server
app.use(serve(__dirname + '/app/views',{defer:true}));



//如果有需要,也可以在action之后添加middleware,但是一般不需要(这里的代码,只有在action里,yield next才会被执行)
// app.use((next) =>{
//     logger.info("i am test log after action");
// })

if (!module.parent) app.listen(config.scheduler.port);

logger.info(`服务已启动，端口:[${config.scheduler.port}]`);