/*
    活动 控制器
 */

const logger = require("../../log/logger");
const resp = require("../framework/responseHelper");
const worker = require("../store/workers");

var map = new Map();


map.set(
    //单号充值
    ["POST","/act/recharge/single"],
    async (ctx,next) =>{
        try{
            let {activityRecordId,activityId,pluginType,phoneNumber}=ctx.request.body;
            
            //todo:通过pm2启动一个worker,并在内存中保留其信息
            let w = worker.bootWorker(activityRecordId,activityId,pluginType,phoneNumber);
            
            ctx.body = {workerId:w?w.id:""};

        }catch (e){
            resp.failed({desc:e.stack},ctx);
        }
        finally {
            //执行流程交给下一个middle-ware
            await next();
        }
    }
);



module.exports=map;
