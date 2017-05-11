/** 在内存中保存worker的状态
 * Created by kaicui on 17/5/2.
 */
const spawn = require('child_process').spawn;
const logger = require('../../log/logger');
const path = require('path');
var {keys, values, entries} = Object;
/**
 * 类型：验证码记录条目
 * @param activityRecordId
 * @param base64
 * @constructor
 */
function ValideCode(activityId,activityRecordId,base64,notifyFn){
    this.id = undefined;//id 等到插入数据库之后，接口返回
    this.activityId = activityId; //活动id
    this.activityRecordId = activityRecordId; //活动记录id
    this.status = 0; //0未打码 1已打码 待核实 2核实成功 3核实失败
    this.base64  = base64;//待代码图片的base64
    this.result = "";//打码员返回的答案
    this.operator = ""; //打码员Id
    this.notifyFn = notifyFn; //用于通知worker的回调函数
}
/**
 * 接收答案，并通知回调
 * @param result
 */
ValideCode.prototype.acceptResult = function (result) {
    this.result = result;
    
    // this.notifyFn && this.notifyFn(result);
    this.notifyFn && this.notifyFn({
        validResult:result,
        validId:this.id
    });
}

/**
 * 类型:worker对象
 * @param id
 * @param proc
 * @constructor
 */
function Worker(activityId,id,proc){
    var self = this;
    
    self.activityId = activityId;
    self.id = id; //worker的id其实就是活动参与记录id
    self.proc = proc;
    self.waitedValidCode = {}; //进程相关的等待处理的验证码记录 ，key:valideCodeId ,value:{ValideCode}
    self.ws =  undefined; //ws链接需要等待worker主动链接上报
}
/**
 *
 * 将某次验证码记录保存到worker对象里面
 * @param base64
 * @param valideCodeId
 * @param fn
 * @returns {ValideCode}
 */
Worker.prototype.saveValidCodeCallback = function (base64,valideCodeId,fn) {
    let v = new ValideCode(this.activityId,this.id,base64,fn);
    this.waitedValidCode[valideCodeId]= v;
    return v;
}
/**
 * 删除内存中的vcode记录
 * @param valideCodeId
 */
Worker.prototype.removeVCode = function (valideCodeId) {
    delete this.waitedValidCode[valideCodeId];
}

module.exports = {
    workers:{},
    
    /**
     * 释放worker数据
     * @param workerId
     */
    workerDispose(workerId){
    
        if(this.workers[workerId]){
            delete this.workers[workerId];
        }
    },
    
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
            // var subProc = spawn("pm2",`start main.js --name ${id} --no-autorestart -- ${id} ${activityRecordId} ${activityId} ${pluginType} ${phoneNumber}`.split(" "),{cwd:path.join(__dirname,"../../worker/")});
            var subProc = spawn("node",`main.js ${id} ${activityRecordId} ${activityId} ${pluginType} ${phoneNumber} >${id}.log &`.split(" "),{cwd:path.join(__dirname,"../../worker/")});

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
                this.workerDispose(id);
            });
            //子进程 启动出错
            subProc.on('error', (err) => {
                logger.error(`worker.error: ${err}`);
                this.workerDispose(id);
            });
            //写入数据集合
            let w = new Worker(activityId,id,subProc);
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
        logger.info(`准备 regWorker，id=${id} clientId=${wsClient.id}`);
        let worker = this.workers[id];
        if(worker){
            worker.ws = wsClient;
            return true;
        }else{
            //todo:(以后删除)为了方便单独调试插件，允许不通过调度来启动worker,而是通过ws注册消息自动注册worker.
            //写入数据集合
            let w = new Worker("",id,undefined);
            this.workers[id] = w;
        }
        return false;
    },
    /**
     * 获取所有worker内部的待处理的验证码
     * @returns {Array}
     */
    getAllValidCodes:function () {
        let _result =[];
        let _workers = this.workers;
        for (let [_, w] of entries(_workers)) {
            let _codes = w.waitedValidCode;
            for (let [_, value] of entries(_codes)) {
                _result.push(value);
            }
        }
        return _result;
    },
    /**
     * 根据指定id获取验证码对象
     * @returns {Array}
     */
    getValidCode:function (codeId) {
        let _workers = this.workers;
        for (let [_, w] of entries(_workers)) {
             let _codes = w.waitedValidCode;
             for (let [key, value] of entries(_codes)) {
                 logger.debug(`getValidCode:key=${key}`)
                 if(key == codeId){
                     return  value;
                 }
             }
             
        }
     return undefined;
    }
}