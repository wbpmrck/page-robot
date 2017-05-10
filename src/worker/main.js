/** worker
 * 1.针对不同的底层实现方案，worker的职责也不相同：
 * 如果是phantomjs,因为他是一个独立的进程，不提供node里的api,所以需要worker通过fork 一个子进程加载phantomjs,并通过进程之间通信来完成任务。
 * 如果是nightmare，他提供Node的api,这样的话worker就无需fork进程了，直接加载对应的插件代码执行就好了
 * Created by kaicui on 17/4/22.
 */

const path = require('path');
const util = require('util');
// console.log(`process.env=${util.inspect(process.env)}`);
//设置配置文件路径
process.env.NODE_CONFIG_DIR=path.join(__dirname,"../config");

const logger = require('../log/logger');
const fs = require('fs');
const wsClient =require("./wsClient");
// const spawn = require('child_process').spawn;

/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`worker Caught exception: ${err}`);
});

process.on('SIGHUP', () => {
    console.log('worker Received SIGHUP.');
});

process.on('exit', (code) => {
    console.log(`worker About to exit with code: ${code}`);
});


logger.info(`启动 worker,argv is:${process.argv}`);
var [,,id,activityRecordId,activityId,pluginType,phoneNumber ]= process.argv;

// logger.info(`活动编号:[${activityId}],插件类型:[${pluginType}],手机号:${phoneNumber}`);
logger.info(`worker id:[${id}],活动编号:[${activityId}],记录编号:[${activityRecordId}],插件类型:[${pluginType}],手机号:${phoneNumber}`);

var tempDataDir = path.resolve(__dirname,"../../data",activityRecordId);

fs.mkdirSync(tempDataDir);

logger.info(`已经创建数据目录:[${tempDataDir}]`);

//先建立ws链接
wsClient.init(id,()=>{
    
    /* ---------------------------------
     启动入口文件：
     相当于:node server.js xxx(后面继续跟参数)
     
     {cws:__dirname}是options,使得这个子进程的工作目录在当前目录开始寻址
     ---------------------------------*/
    // var subProc = spawn("node",["entry.js","1234"],{cwd:path.join(__dirname,"/scripts/plugins/",`act-${process.argv[2]}`)});
    
    
    var pluginDir = path.join(__dirname,"/scripts/plugins/",`act-${pluginType}/entry`);
    logger.info(`准备加载插件:${pluginDir}`);
    
    var plugin = require(pluginDir);
    logger.info(`准备执行插件入口main方法`);
    
    plugin && plugin.main(activityRecordId,activityId,phoneNumber,tempDataDir,function (success, result) {
        logger.info(`活动参与结果:${success},返回信息:${result}`);
        wsClient.quit();
    });
});



// //子进程的标准输出
// subProc.stdout.on('data', (data) => {
//     console.log(`subproc.stdout: ${data}`);
// });
// //子进程的错误
// subProc.stderr.on('data', (data) => {
//     console.log(`subproc.stderr: ${data}`);
// });
// //子进程的关闭
// subProc.on('close', (code) => {
//     console.log(`subproc.close:child process exited with code ${code}`);
// });
// //子进程 启动出错
// subProc.on('error', (err) => {
//     console.log(`subproc.error: ${err}`);
// });
