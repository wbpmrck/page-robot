/** 在内存中保存worker的状态
 * Created by kaicui on 17/5/2.
 */
const spawn = require('child_process').spawn;
const logger = require('../../log/logger');
const path = require('path');
function Worker(id,proc){
    var self = this;
    
    self.id = id;
    self.proc = proc;
    self.data = {}; //进程相关的业务数据
    self.ws =  undefined; //ws链接需要等待worker主动链接上报
}

module.exports = {
    workers:{},
    
    /**
     *  创建一个Worker
     * @param activityRecordId:活动参与编号,其作为worker的id,不能重复使用
     * @param activityId:活动id
     * @param pluginType:插件类型
     * @param phoneNumber:手机号
     * @returns {Worker}:返回创建的Worker对象
     */
    bootWorker:function (activityRecordId,activityId,pluginType,phoneNumber) {
        
        logger.info(`活动编号:[${activityId}],记录编号:[${activityRecordId}],插件类型:[${pluginType}],手机号:${phoneNumber}`);
        
        logger.info("准备form子进程，使用pm2启动worker...");
        
        // let id = `活动:${pluginType}>${activityRecordId}`;
        let id = activityRecordId;
    
        if(this.workers[id]){
            logger.error("已经存在这个Worker:%s",id);
        }else{
            //通过pm2启动 worker
            var subProc = spawn("pm2",`start main.js --name ${id} --no-autorestart -- ${id} ${activityRecordId} ${activityId} ${pluginType} ${phoneNumber}`.split(" "),{cwd:path.join(__dirname,"../../worker/")});

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
            //写入数据集合
            let w = new Worker(id,subProc);
            this.workers[id] = w;
            return w;
        }
        
        
    },
    /**
     * worker主动连接的时候，调用
     * @param id:worker的id. 等价于pm2的name,唯一标识一个Worker
     * @param wsClient 发送注册消息的worker的wsClient
     * @returns {boolean} :是否注册成功
     */
    regWorker:function (id, wsClient) {
        let worker = this.workers[id];
        if(worker){
            worker.ws = wsClient;
            return true;
        }
        return false;
    }
}