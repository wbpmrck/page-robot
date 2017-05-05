/** 处理scheduler的所有websocket消息
 * Created by kaicui on 17/5/4.
 */

const logger = require('../../log/logger');
const path = require('path');
const config = require('config');
const wokers = require('../store/workers');

//ws客户端角色
var {clientRole,respCodes,msg} = require("./consts");


module.exports={
    /**
     * 启动 webSocket 服务
     * @param io
     */
    run(io){
        
        io.on('connection', function(client){
            
            //对注册的处理
            client.on(msg.reg, (id,role,reply)=>{
                logger.info(`收到 client :${client.id} 发送的 reg 消息,role=${role}`);
                client.join(role);
                client._role = role;
                wokers.regWorker(id,client);
                reply(respCodes.ok); //回复
            });
            
            client.on(msg.getValidateCode,(pngBase64,reply)=>{
                logger.debug(`收到图片请求:base64=4${pngBase64}`);
                reply("1234"); //todo:模拟返回答案
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
