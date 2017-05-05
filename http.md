# http 接口文档

`scheduler` 调度程序默认会在 `1234` 端口进行http监听，可以通过http请求向 `scheduler` 发送指令，开启 `worker` 进行工作。

## 接口的鉴权
目前http接口的鉴权比较简单，只需要http请求的 `header` 部分含有指定的key,value即可，具体配置在 `config/default.js` 里:

```
scheduler:{
        //...略
        auth:{
          userName:"ifly-flow-scheduler",//http 所有请求头需要带上这个才可以受理
          userNameHeaderName:"ifly-auth" //http 鉴权请求头名称
        }
}
```

## 接口的路由
本框架的http服务基于 `koa2` 实现，使用 `koa-router` 进行了一层包装，具体的注册路由部分在 `src/scheduler/routes/index.js` 里进行，通过读取 `scheduler/controllers/*.js` 的内容，自动注册路由，下面是一个例子:

```js


var map = new Map(); //创建一个路由注册项map

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
            let {activityRecordId,activityId,pluginType,phoneNumber}=ctx.request.body;

            //通过pm2启动一个worker,并在内存中保留其信息
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



module.exports=map; //需要把map作为exports

```

> 本框架使用map来保存路由条目，主要的目的就是简化路由的编写
> 同时利用 `koa-router` 的路由name属性给路由附带额外信息，然后在 `scheduer/interceptors/auth.js` 里面对路由name进行判断，决定是否需要鉴权

## 接口列表
下面是已经完成的接口列表，待补充:

### ["POST","/act/recharge/single"]
- 提交单个号码充值请求
    - 输入:
        - body:{activityRecordId,activityId,pluginType,phoneNumber}
    - 输出:
        - 样例:
        ```
        {
          "code": "0000",
          "desc": "成功",
          "data": {
            "workerId": "record025"
          },
          "success": true
        }
        ```


## 返回码列表
具体可参见 `src/scheduler/framework/responseHelper.js`里面的定义
- '0000':成功