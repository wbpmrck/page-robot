/** 常用常量定义
 * Created by kaicui on 17/5/4.
 */


//ws客户端角色
module.exports ={
    clientRole:{
        admin:"admin",
        worker:"worker"
    },
    //返回码定义
    respCodes:{
        ok:"0000"
    },
    msg:{
        "reg":"reg", //注册 worker,admin->scheduler
        "getValidateCode":"getValidCode", //获取验证码答案请求 worker->scheduler
        "vCodePush":"vCodePush", //验证码推送 scheduler->admin
        "vCodeSubmit":"vCodeSubmit", //验证码答案提交 admin->scheduler
    }
};
