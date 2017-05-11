/** 处理scheduler的所有websocket消息
 * Created by kaicui on 17/5/4.
 */

const logger = require('../../log/logger');
const path = require('path');
const config = require('config');
const wokers = require('../store/workers');

const validCodeService = require("../service/validCode");
const activityService = require("../service/activity");
//ws客户端角色
var {clientRole,respCodes,msg} = require("./consts");


module.exports={
    /**
     * 启动 webSocket 服务
     * @param io
     */
    run(io){
        
        io.on('connection', function(client){
            
            //对注册的处理 worker,admin->scheduler
            client.on(msg.reg, (id,role,reply)=>{
                logger.info(`收到 client :${client.id} 发送的 reg 消息,role=${role}`);
                client.join(role);
                client._role = role;
                //如果该client是 worker
                if(role === clientRole.worker){
                    //在client对象上保存一些业务属性
                    client._workerId = id;
                    wokers.regWorker(id,client);
                    reply(respCodes.ok); //回复
                }else{
                    //如果client是admin
                    //把所有等待处理的验证码列表发过去
                    reply(wokers.getAllValidCodes())
                }
                
                
            });
            
            // 消息处理：获取验证码答案请求  worker->scheduler
            // client.on(msg.getValidateCode,(valideCodeId,pngBase64,reply)=>{
            client.on(msg.getValidateCode,(pngBase64,reply)=>{
                // logger.debug(`收到图片请求,base64=${pngBase64}`);
                let w = wokers.workers[client._workerId];
                if(w){
                    
                    logger.debug(`准备调用service,新增打码记录，并拿到Id`);
                    validCodeService.newValidateCodeRecord({activityId:w.activityId,activityRecordId:w.id,base64:pngBase64}).then(function (resp) {
                        if(resp && resp.code =='0000'){
                            let valideCodeId = resp.content.id;
                            let vCodeRecord = w.saveValidCodeCallback(pngBase64,valideCodeId,reply); //暂存回调函数，用于后续收到admin的打码记录之后回调
    
                            vCodeRecord.id = valideCodeId;
                            logger.debug(`调用service,新增打码记录，拿到Id=${valideCodeId}`);
                            //推送消息给所有的admin clients
                            io.to(clientRole.admin).emit(msg.vCodePush,[vCodeRecord]);//新验证码推送 scheduler->admin
                        }else{
                            logger.error(`调用service,新增打码记录错误:${resp.code}:${resp.desc}`);
                            reply("err");//返回错误的验证码给worker，使得流程继续
                        }
                    }).catch(function (err) {
                        logger.error(`调用service,新增打码记录错误:${err.stack}`);
                        reply("err");//返回错误的验证码给worker，使得流程继续
                    });
                }else{
                    logger.error(`寻找worker:${client._workerId}错误，没找到!`);
                    reply("err");//返回错误的验证码给worker，使得流程继续
                }
                // reply("1234"); //模拟返回答案
            });
            
            //反馈验证码答案 worker => scheduler
            client.on(msg.writeVCodeResult,(validId,vresult,reply)=>{
                logger.debug(`收到 writeVCodeResult,validId=${validId},vresult=${vresult}`);
                let w = wokers.workers[client._workerId];
                if(w){
                    
                    logger.debug(`准备调用service,记录验证码结果`);
                    validCodeService.saveValidateResult({vcodeId:validId,vresult:vresult}).then(function (resp) {
                        logger.debug(`调用service,记录验证码结果，ret.code=${resp.code}`);
                        //删除内存中的验证码记录
                        w.removeVCode(validId);
                        reply &&reply(true)
                    }).catch(function (err) {
                        logger.error(`调用service,记录验证码结果:${err.stack}`);
                    });
                }else{
                    logger.error(`寻找worker:${client._workerId}错误，没找到!`)
                }
            });
            
            //反馈参与记录结果 worker => scheduler
            client.on(msg.activityRecordEnd,(activityRecordId,successFlag,failedReason,reply)=>{
                logger.debug(`收到 activityRecordEnd,activityRecordId=${activityRecordId},successFlag=${successFlag},failedReason=${failedReason}`);
                let w = wokers.workers[client._workerId];
                if(w){
                    
                    logger.debug(`准备调用service,反馈参与记录结果`);
                    activityService.endActivityRecord({activityRecordId,successFlag,failedReason}).then(function (ret) {
                        logger.debug(`调用service,反馈参与记录结果，ret.code=${ret.code}`);
                        reply &&reply(true)
                    }).catch(function (err) {
                        logger.error(`调用service,反馈参与记录结果:${err.stack}`);
                    });
                }else{
                    logger.error(`寻找worker:${client._workerId}错误，没找到!`)
                }
            });
            
            // 消息处理：验证码答案提交  admin->scheduler
            client.on(msg.vCodeSubmit,(valideCodeId,answer,reply)=>{
                logger.debug(`收到 验证码答案提交 请求,valideCodeId:${valideCodeId},answer=${answer}`);
                //获取validate code,保存答案，然后通知worker
                let code =wokers.getValidCode(valideCodeId);
                if(code){
                    code.acceptResult(answer);
                    logger.debug(`已经把id=${valideCodeId}的答案[${answer}]发送给worker!`);
                    reply(true);
                }else{
                    reply(false);
                    logger.error(`寻找 vcode:${valideCodeId}错误，没找到!`);
                }
                
            });
            
            //客户端断开的处理
            client.on('disconnect', function(){
                logger.info(`client :[${client._role}]${client.id} 已经断开链接`);
            });
        });
        
        io.listen(config.scheduler.ws.port);
        logger.info(`websocket 服务已启动，端口:[${config.scheduler.ws.port}]`);
    }
}
