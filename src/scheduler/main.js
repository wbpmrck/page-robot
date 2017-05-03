/** scheduler 负责在服务器上启动worker
 * Created by kaicui on 17/4/22.
 */

const logger = require('../log/logger');
const path = require('path');
// const spawn = require('child_process').spawn;

const koa = require('koa'),
    views = require('koa-views'),
    config = require('config'),
    serve = require('koa-static');
const session = require('koa-session2');

/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`scheduler Caught exception: ${err.stack}`);
});

process.on('SIGHUP', () => {
    console.log('scheduler Received SIGHUP.');
});

process.on('exit', (code) => {
    console.log(`scheduler About to exit with code: ${code}`);
});


logger.info(`启动 scheduler,argv is:${process.argv}`);


var app = module.exports = new koa();


/* ---------------------------------
 加载中间件
 ---------------------------------*/


// 1.helpers
app.use(require('./interceptors/context-extend'));

// 2.bodyparser
app.use(require('koa-bodyparser')());

// 3.日志
app.use(require('./interceptors/logger'));

// 4.session middleware
app.use(session(config.scheduler.session));

// 6.登录鉴权
app.use(require('./interceptors/auth'));

// 7.initialize render helper
app.use(views(path.join(__dirname,config.scheduler.template.path), config.scheduler.template.options));


/* ---------------------------------
 注册路由
 ---------------------------------*/
require('./routes').auto(app);

// 8.static file server
app.use(serve(path.join(__dirname,config.scheduler.template.path),{defer:true}));



//如果有需要,也可以在action之后添加middleware,但是一般不需要(这里的代码,只有在action里,yield next才会被执行)
// app.use(function *(next) {
//     logger.info("i am test log after action");
// })

if (!module.parent) app.listen(config.scheduler.port);

console.log(`服务已启动，端口:[${config.scheduler.port}]`);





//todo:下面全部是启动一个worker的代码，应该放到某一个controller下面去
// var [,,activityRecordId,activityId,pluginType,phoneNumber ]= process.argv;
//
// logger.info(`活动编号:[${activityId}],记录编号:[${activityRecordId}],插件类型:[${pluginType}],手机号:${phoneNumber}`);
//
// logger.info("准备form子进程，使用pm2启动worker...");
// //通过pm2启动 worker
// var subProc = spawn("pm2",`start main.js --name 活动:${pluginType}>${activityRecordId} --no-autorestart -- ${activityRecordId} ${activityId} ${pluginType} ${phoneNumber}`.split(" "),{cwd:path.join(__dirname,"../worker/")});
//
//
//
// //子进程的标准输出
// subProc.stdout.on('data', (data) => {
//     logger.debug(`worker.stdout: ${data}`);
// });
// //子进程的错误
// subProc.stderr.on('data', (data) => {
//     logger.error(`worker.stderr: ${data}`);
// });
// //子进程的关闭
// subProc.on('close', (code) => {
//     logger.info(`worker.close:child process exited with code ${code}`);
// });
// //子进程 启动出错
// subProc.on('error', (err) => {
//     logger.error(`worker.error: ${err}`);
// });

// setInterval(function () {
//     logger.info("scheduler is running...")
// },60000);