/** worker 的启动入口2
 * 使用nightmare作为驱动
 * Created by kaicui on 17/4/22.
 */

const logger = require('../../../../log/logger');
const wsClient = require("../../../wsClient");
var {clientRole,respCodes,msg} = require("../../../../scheduler/websocket/consts");
var failedReason = require("../../../../consts/failedReason");
const dateFormat = require('dateformat');
const fs = require("fs");

var config = require("config");

var Nightmare = require('nightmare');
var  co = require('co');
var _ = require("../../common/gesture-nightmare");
var path = require("path");
var nightmare = Nightmare({
    show: true ,
    typeInterval:100,
    height: 720,
    width:690,
    webPreferences: {
        preload: path.resolve(__dirname,"../../common/elementHelper.js")
        // preload: path.resolve("../../common/touch-inject.js")
        // preload: path.resolve("../../common/phantom-limb.js")
        //alternative: preload: "absolute/path/to/custom-script.js"
    }
});

var topicsData = require("./topics.data");
var coUtils = require("../../../../utils/co-utils"),
    sleep=  coUtils.sleep;


var submit_count = 1;//提交答案的次数（主要用于规范各种截图的命名)

logger.info("启动 国务院活动插件");

/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`entry Caught exception: ${err}`);
});

process.on('SIGHUP', () => {
    console.log('entry Received SIGHUP.');
});

process.on('exit', (code) => {
    console.log(`entry About to exit with code: ${code}`);
});

/*  --------------------------
        开始运行机器人
    --------------------------
 */

var entryPageUrl = "http://app.www.gov.cn/govdata/html5/2017cyc/?_source=govapp";
var ua = "Mozilla/5.0 (Linux; Android 7.0; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36 GovCnAndroid(huawei;8)";


var _afterSeeValidCode = function *(activityRecordId,activityId,phoneNumber,fileDir) {
    //验证码截图
    let clientRect = yield nightmare
        .wait(1000)
        .wait(".mugine_class_1043")
        .getRect(".mugine_class_1043");
    logger.info("获取到验证码区域为: %s",JSON.stringify(clientRect));
    // let pngDir = path.join(fileDir,`/validCode-${dateFormat(new Date(),"yyyy-mm-dd'T'HH-MM-ss")}.png`);
    let pngDir = path.join(fileDir,`/validCode-${submit_count}.png`);
    logger.info("准备验证码截图到: %s",pngDir);
    
    yield nightmare
        .focus(".mugine_class_1045")// 结束phantom-limb模式，方便截图
        .wait(500)
        .keypress(27)
        .wait(500);
    
    yield nightmare.screenshot(pngDir,clientRect);
    
    yield nightmare
        .focus(".mugine_class_1045")// 开启phantom-limb模式，方便后续操作
        .wait(500)
        .keypress(27);
    
    logger.info(`准备对验证码图片:${pngDir} 进行base64...`);
    let buf = fs.readFileSync(pngDir);
    let base64 = buf.toString("base64");
    
    
    // let valideCodeId = pngDir; //用图片路径作为验证码唯一标识
    // let validResult = yield wsClient.send(msg.getValidateCode,valideCodeId,base64); //获取到的验证码
    let {validResult,validId }= yield wsClient.send(msg.getValidateCode,base64); //获取到的验证码
    
    logger.info(`得到验证码图片:${pngDir} 的答案:${validResult}`);
    
    //输入验证码
    yield nightmare
        .focus(".mugine_class_1042")
        .wait(1000)
        .type(".mugine_class_1042","") //先清空
        .type(".mugine_class_1042",validResult)
    ;
    
    logger.info(`验证码答案:[${validResult}]输入完毕,准备进行提交按钮点击前的截图.`);
    
    //提交前的截图
    let submitPrePng = path.join(fileDir,`/submit-pre-${submit_count}.png`);
    yield nightmare.screenshot(submitPrePng);
    
    //按钮提交点击
    yield nightmare
        .tap(".mugine_class_1045")
        .wait(100);
    logger.info(`提交按钮点击完毕，准备进行提交后截图`);
    //提交后的截图
    let submitAfterPng = path.join(fileDir,`/submit-after-${submit_count}.png`);
    yield nightmare.screenshot(submitAfterPng);
    
    //根据提交之后的界面，判断提交结果：
    let resultFlag = yield nightmare
        .wait(function () {
            
            var failedReason={
                PHONE_FORMAT_ERROR:"0001",//手机号码格式 错误
                PHONE_EMPTY:"0002",//请输入手机号
                VCODE_EMPTY:"0003",//请输入验证码
                VCODE_ERR:"0004",//验证码不对
                PHONE_EXISTED:"0005",//号码已经存在
                LIMIT_REACH:"0006",//今日流量奖励已经达到上限
                IP_DUMP:"0007",//提交的人数太多(其实是ip限制)
                PROVINCE_ERR:"0008"//本次活动只针对移动、电信、联通
            }
            
            function _logResultCode(code){
                
                var pre_h = document.getElementsByClassName("log_err")[0];
                if(pre_h){
                    document.body.removeChild(pre_h);
                }
                
                var h = document.createElement('h3');
                h.className = "log_err";
                h.innerText = code;
                document.body.appendChild(h);
            }
            var checkList=[
                {className:"mugine_class_1053",resultCode:failedReason.PHONE_FORMAT_ERROR}, //手机号码格式 错误
                {className:"mugine_class_1054",resultCode:failedReason.PHONE_EMPTY}, //请输入手机号
                {className:"mugine_class_1055",resultCode:failedReason.VCODE_EMPTY}, //请输入验证码
                {className:"mugine_class_1056",resultCode:failedReason.VCODE_ERR}, //验证码不对
                {className:"mugine_class_1057",resultCode:failedReason.PHONE_EXISTED}, //号码已经存在
                {className:"mugine_class_1058",resultCode:failedReason.LIMIT_REACH}, //今日流量奖励已经达到上限
                {className:"mugine_class_1060",resultCode:failedReason.IP_DUMP},  //提交的人数太多(其实是ip限制)
                {className:"mugine_class_1061",resultCode:failedReason.PROVINCE_ERR}, //本次活动只针对移动、电信、联通
                {className:"mugine_class_1063",resultCode:"success"}, //充值成功
            ];
            
            for(var i=0;i<checkList.length;i++){
                let d = document.getElementsByClassName(checkList[i].className)[0];
                if(d.style.display=='block'){
                    _logResultCode(checkList[i].resultCode)
                    return true;
                }
            }
        });
    
    let resultCode =yield nightmare
        .wait(500)
        .evaluate(function () {
            let dom = document.getElementsByClassName("log_err")[0];
            return dom.innerText.toString();
        });
    logger.info(`活动记录[${activityRecordId}]第${submit_count}次提交，执行结果返回码:${resultCode.toString()},${typeof resultCode}`);
    submit_count++;
    
    //反馈验证码结果给调度
    let vresult = resultCode!=failedReason.VCODE_EMPTY &&resultCode!=failedReason.VCODE_ERR;
    let vcodeWriteRet = yield wsClient.send(msg.writeVCodeResult,validId,vresult);
    logger.info(`验证码[${validId}]答案结果:${vresult},反馈给调度得到响应:${vcodeWriteRet}`);
    return resultCode;
}


var run = function*(activityRecordId,activityId,phoneNumber,fileDir) {

    try {
        var subjectIndex=1;
        //打开页面，进入 答题主流程。直到验证码填写步骤
        let result = yield function*() {
            yield nightmare
                .useragent(ua)
                .goto(entryPageUrl)
            
                .wait('.mugine_class_981')
                .inject("js",path.resolve(__dirname,"../../common/phantom-limb.js")) //加载js库，用于辅助模拟手势
                .wait(3000)
            
                .tap('.mugine_class_981 .curve_render path') //开始答题
            
                .wait(3000)
                .wait('.mugine_class_985')
                .tap(".mugine_class_985") //点击关闭提示
                .wait('.mugine_class_989') //看到"政府报告知多少"
            ;
        
            for(;subjectIndex<=10;subjectIndex++){
                logger.info(`开始做第${subjectIndex}题--->`);
                let title = yield nightmare
                    .wait(800)
                    //获取题干
                    .evaluate(function () {
                        let stage = document.getElementsByClassName("mugine_class_0")[0];
                        let size = stage.getBoundingClientRect();
                        let dom=  document.elementFromPoint(parseInt( (size.right-size.left)/2), parseInt( (size.bottom-size.top)/2 -50));
                        return dom.innerText;
                    });
                //处理其他字符
                title = title.replaceAll("）","").replaceAll("（","").replaceAll(" ","").replace(/&nbsp;/g, "'").replace(/\s+/g, "");
                logger.debug("title="+title);
                if(title.length<1){
                    logger.error("题目没找到!")
                    break;
                }
                let answerBtn = topicsData.find(title);
                logger.debug("answer ="+answerBtn);
                if(answerBtn){
                    //点击答案
                    yield nightmare
                        .wait(1000)
                        .tap(answerBtn)
                        .wait(1000)
                        .tap(".mugine_class_841");
                }else{
                    logger.error("题目没找到答案!")
                    break;
                }
                if(subjectIndex==10){
                    logger.info("准备输入手机号!")
                    yield nightmare
                        .tap(".mugine_class_843")
                        .wait(".mugine_class_1039")
                        .wait(2000)
                        .focus(".mugine_class_1041")
                        .wait(1000)
                        .type(".mugine_class_1041",phoneNumber);
                    break;
                }
            }
            return `${subjectIndex}/10 的题目已经答完！`;
        };
        logger.info("答题主流程,返回结果: %s",result);


        let resultCode = yield _afterSeeValidCode(activityRecordId,activityId,phoneNumber,fileDir);
        
        //如果一直是验证码的问题，则切换了验证码之后继续这一步骤
        while (resultCode===failedReason.VCODE_ERR || resultCode===failedReason.VCODE_EMPTY){
            if(submit_count<config.worker.vcode_retry_times){
                logger.info(`验证码出现问题，准备进行第:${submit_count} 次提交，先切换验证码`);
                yield nightmare
                    .wait(1500) //等待弹出框消失
                    .tap(".mugine_class_1043")
                    .wait(500);
    
                resultCode = yield _afterSeeValidCode(activityRecordId,activityId,phoneNumber,fileDir);
            }else{
                break;
            }
        }
        
        //重试结束，反馈最终活动参加记录结果给调度
        let successFlag = resultCode === 'success';
        //反馈参与记录结果(记录id,成功标记,失败原因)
        let endRet= yield wsClient.send(msg.activityRecordEnd,activityRecordId,successFlag,successFlag?"":resultCode);
        logger.info(`反馈参与记录结果，得到响应:${endRet}`);
    
        //结束
        yield nightmare
            .wait(3000)
            .focus(".mugine_class_1045")// 结束phantom-limb模式，方便人工手动纠正问题
            .wait(500)
            .keypress(27);
        
        yield nightmare.end();  //todo:需要自动退出机器人进程，结束
        
    }catch (e){
        logger.error("出现错误:%s",e.stack);
    }
};

module.exports={
    /**
     * worker通过调用这个方法加载插件执行
     * @param activityRecordId:活动记录id
     * @param activityId:活动id
     * @param phoneNumber:手机号
     * @param onFinish:结束的回调 fn(bool,result)
     */
    main:function (activityRecordId,activityId,phoneNumber,fileDir,onFinish) {
        //use `co` to execute the generator function
        co.wrap(run)(activityRecordId,activityId,phoneNumber,fileDir).then(function(result) {
            logger.info("插件运行结束，输出结果:"+result);
            onFinish && onFinish(true,result);
        }, function(err) {
            logger.error(err.stack);
            onFinish && onFinish(false,err);
        });
    }
}






