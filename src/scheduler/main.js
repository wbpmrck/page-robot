/** scheduler 负责在服务器上启动worker
 * Created by kaicui on 17/4/22.
 */

const logger = require('../log/logger');
const path = require('path');
const spawn = require('child_process').spawn;



/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`scheduler Caught exception: ${err}`);
});

process.on('SIGHUP', () => {
    console.log('scheduler Received SIGHUP.');
});

process.on('exit', (code) => {
    console.log(`scheduler About to exit with code: ${code}`);
});


logger.info(`启动 scheduler,argv is:${process.argv}`);
var [,,activityRecordId,activityId,pluginType,phoneNumber ]= process.argv;

logger.info(`活动编号:[${activityId}],记录编号:[${activityRecordId}],插件类型:[${pluginType}],手机号:${phoneNumber}`);

logger.info("准备form子进程，使用pm2启动worker...")
//通过pm2启动 worker
var subProc = spawn("pm2",`start main.js --name 活动:${pluginType}>${activityRecordId} --no-autorestart -- ${activityRecordId} ${activityId} ${pluginType} ${phoneNumber}`.split(" "),{cwd:path.join(__dirname,"../worker/")});



//子进程的标准输出
subProc.stdout.on('data', (data) => {
    logger.debug(`worker.stdout: ${data}`);
});
//子进程的错误
subProc.stderr.on('data', (data) => {
    logger.error(`worker.stderr: ${data}`);
});
//子进程的关闭
subProc.on('close', (code) => {
    logger.info(`worker.close:child process exited with code ${code}`);
});
//子进程 启动出错
subProc.on('error', (err) => {
    logger.error(`worker.error: ${err}`);
});

setInterval(function () {
    logger.info("scheduler is running...")
},60000)