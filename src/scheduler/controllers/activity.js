/*
    活动 控制器
 */

const logger = require("../../log/logger");
const resp = require("../framework/responseHelper");
const worker = require("../store/workers");

const activityService = require("../service/activity");

var map = new Map();

/*
 这里每一个注册条目是一个map的item,key是一个数组，value是handler函数
 数组的第一个参数表示 method 类型，可以是 POST,GET等
 数组的第二个参数表示路径匹配规则，具体可以参见 https://github.com/alexmingoia/koa-router
 数组的第三个参数，对应 koa-router 里面的路由名，但是在本框架里使用他来给路由附带额外信息，比如"ALLOW_ANONYMOUS"表示该路由不需要经过auth.js检查
 */
map.set(
    //单号充值
    ["POST","/act/recharge/single"],
    async (ctx,next) =>{
        try{
            // let {activityRecordId,activityId,pluginType,phoneNumber}=ctx.request.body;
            let {activityRecordId,activityId,pluginType,phoneNumber}=ctx.request.body;
            
            let result = await activityService.beginActivity({activityRecordId,activityId,pluginType,phoneNumber});
            
            
            //通过pm2启动一个worker,并在内存中保留其信息
            let w = worker.bootWorker(activityRecordId,activityId,pluginType,phoneNumber);
            
            ctx.body = resp.success({data: {workerId:w?w.id:""}});

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
