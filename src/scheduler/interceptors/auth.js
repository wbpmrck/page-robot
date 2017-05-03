'use strict';
/**
 * Created by kaicui on 16/11/15.
 * 拦截器:用户登录状态检查
 */

const logger = require('../../log/logger');
const config = require("config");
const resp = require("../framework/responseHelper");

module.exports=async (ctx,next)=>{
    let route = require('../routes').getRouter();
    let req= ctx.request; // Request 对象
    let session = ctx.session; // session 对象
    //指定路由不做检查 ,静态文件路由(含.)不做检查
    // if(allowUrl.filter(x=>(req.path.indexOf(x)==0) ).length>0 || req.path.indexOf(".")>-1){
    let matched  =route.match(req.path);

    //判断哪些路由不需要进行登录检查
    if( (matched && matched.length>0 && matched[0].name=='ALLOW_ANONYMOUS' )|| req.path.indexOf(".")>-1){
        logger.debug("指定路由不做检查");
        await next();
    }else{
        logger.debug("检查登录状态");
        if(!session.user){
            
            //如果传入了头部字段，进行校验，符合的话自动登录
            if(ctx.request.header[config.scheduler.auth.userNameHeaderName]===config.scheduler.auth.userName){
                ctx.setSessionUser({ip:ctx.ip}); //自动登录
                await next();
            }else{
                //不符合的话进行报错:
                
                // todo:目前调度器没有登录页面，先全部返回json的错误
                //如果是html请求
                // if(this.request.headers["accept"].indexOf('text/html')>-1){
                //     如果是页面，则重定向
                    // this.response.redirect('/login');
                // }else{
                    // 如果是ajax
                    resp.failed({code:resp.codes.NOT_LOGIN},ctx);
                // }
            }
            
        }else{
            //已经登录的，放行
            await next();
        }
    }
}
