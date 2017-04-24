/** worker 的启动入口
 * Created by kaicui on 17/4/22.
 */

const logger = require('../log/logger');
const path = require('path');
const spawn = require('child_process').spawn;
logger.info("启动 worker");



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


logger.info(`启动 subproc,argv is:${process.argv}`);

/* ---------------------------------
 启动入口文件：
 相当于:node server.js xxx(后面继续跟参数)
 
 {cws:__dirname}是options,使得这个子进程的工作目录在当前目录开始寻址
 ---------------------------------*/
// var subProc = spawn("node",["entry.js","1234"],{cwd:path.join(__dirname,"/scripts/plugins/",`act-${process.argv[2]}`)});

//todo:通过node进程去调用pm2,主要是方便动态的传入一些运行时才可以决定的参数
var subProc = spawn("pm2",["start","pm2.config.js"],{cwd:path.join(__dirname,"/scripts/plugins/",`act-${process.argv[2]}`)});



//子进程的标准输出
subProc.stdout.on('data', (data) => {
    console.log(`subproc.stdout: ${data}`);
});
//子进程的错误
subProc.stderr.on('data', (data) => {
    console.log(`subproc.stderr: ${data}`);
});
//子进程的关闭
subProc.on('close', (code) => {
    console.log(`subproc.close:child process exited with code ${code}`);
});
//子进程 启动出错
subProc.on('error', (err) => {
    console.log(`subproc.error: ${err}`);
});

