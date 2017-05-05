/** 负责 worker 的ws 通信职责
 * Created by kaicui on 17/5/4.
 */
const config = require("config");
const logger = require("../log/logger");
var {clientRole,respCodes,msg} = require("../scheduler/websocket/consts");

var socket; //因为worker是通过多进程方式启动的，所以一个进程里只有一个websocket链接
module.exports={
    quit(){
      socket && socket.disconnect();
    },
  init(workerId,onSuccess){
      
      logger.info(`准备初始化worker:${workerId}与调度:http://localhost:${config.scheduler.ws.port}的websocket链接`)
    
      socket = require('socket.io-client')(`http://localhost:${config.scheduler.ws.port}`);
      socket.on('connect', function(){
            logger.info("ws链接成功,准备进行注册");
            socket.emit(msg.reg,workerId,clientRole.worker,function onReply(rep){
                logger.info(`收到调度对注册消息的反馈:${rep}`);
                onSuccess && onSuccess(); //回调
            });
      });
      socket.on('disconnect', function(){
          logger.info("ws链接已经断开");
      });
  },
    send(){
      var args = Array.prototype.slice.call(arguments);
      var p = new Promise(function (resolve, reject) {
          if(socket && socket.connected){
              logger.debug(`socket 发送消息给调度: ${args[0]}`);
              let onReply = (resp)=>{
                  resolve(resp);
              }
              args.push(onReply); //将回调处理作为socket.io emit 方法的最后一个参数
              
              socket.emit.apply(socket,args);
          }else{
              logger.info(`socket 链接未成功链接.无法发送:${args[0]}`);
              reject();
          }
      });
      return p;
    }
};

