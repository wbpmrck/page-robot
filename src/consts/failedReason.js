/** 关于活动订购结果类型的定义
 * Created by kaicui on 17/5/10.
 *
 *
 */



module.exports={
    PHONE_FORMAT_ERROR:"0001",//手机号码格式 错误
    PHONE_EMPTY:"0002",//请输入手机号
    VCODE_EMPTY:"0003",//请输入验证码
    VCODE_ERR:"0004",//验证码不对
    PHONE_EXISTED:"0005",//号码已经存在
    LIMIT_REACH:"0006",//今日流量奖励已经达到上限
    IP_DUMP:"0007",//提交的人数太多(其实是ip限制)
    PROVINCE_ERR:"0008"//本次活动只针对移动、电信、联通
}
