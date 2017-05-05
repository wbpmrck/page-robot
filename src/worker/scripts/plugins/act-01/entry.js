/** worker 的启动入口2
 * 使用nightmare作为驱动
 * Created by kaicui on 17/4/22.
 */

const logger = require('../../../../log/logger');
const wsClient = require("../../../wsClient");
var {clientRole,respCodes,msg} = require("../../../../scheduler/websocket/consts");
const dateFormat = require('dateformat');
const fs = require("fs");

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



var run = function*(activityId,phoneNumber,fileDir) {

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
                        .type(".mugine_class_1041",phoneNumber)
    
                        .focus(".mugine_class_1045")//结束phantom-limb模式，方便人工手动纠正问题
                        .wait(500)
                        .keypress(27);
                    break;
                }
            }
            return `${subjectIndex}/10 的题目已经答完！`;
        };
        logger.info("答题主流程,返回结果: %s",result);
        //todo:这里需要把验证码发送到外部系统，然后监听回发的结果
        logger.info("正在等待验证码...");
        //验证码截图
        let clientRect = yield nightmare
            .wait(1000)
            .wait(".mugine_class_1043")
            .getRect(".mugine_class_1043");
        logger.info("获取到验证码区域为: %s",JSON.stringify(clientRect));
        let pngDir = path.join(fileDir,`/validCode-${dateFormat(new Date(),"yyyy-mm-dd'T'HH-MM-ss")}.png`);
        logger.info("准备验证码截图到: %s",pngDir);
        yield nightmare.screenshot(pngDir,clientRect);
        
        logger.info(`准备对验证码图片:${pngDir} 进行base64...`);
        let buf = fs.readFileSync(pngDir);
        let base64 = buf.toString("base64");
        
    
        let validResult = yield wsClient.send(msg.getValidateCode,base64); //获取到的验证码
    
        logger.info(`得到验证码图片:${pngDir} 的答案:${validResult}`);
        // let validResult = ""; //获取到的验证码
        // let validCodeWaitStart = new Date();//开始等验证码输入的时间(方便监控看出验证码过期情况)
        // let dotCount = 1;
        //
        //
        // // //模拟从远端获取验证码
        // // setTimeout(function () {
        // //     logger.info("模拟15s从远端获取到1个验证码");
        // //     validResult="1234";
        // //     // validResult = yield co.wrap(function *(valideCode) {
        // //     //     yield nightmare
        // //     //         .focus(".mugine_class_1042")
        // //     //         .wait(1000)
        // //     //         .type(".mugine_class_1042",valideCode)
        // //     //
        // //     //         .focus(".mugine_class_1045")//结束phantom-limb模式，方便人工手动纠正问题
        // //     //         .wait(500)
        // //     //         .keypress(27);
        // //     //
        // //     //     logger.info(`验证码${valideCode}输入完毕`);
        // //     //     return true;
        // //     //
        // //     // })("1234");
        // // },15000);
        // //
        // // //等待验证码输入完毕
        // // while(!validResult){
        // //     logger.info(`等待输入验证码${new Array(dotCount=++dotCount%8).join(".")},已经等待了${(new Date()-validCodeWaitStart) /1000}秒`);
        // //     yield sleep(3000);
        // // }
        yield nightmare
            .focus(".mugine_class_1042")
            .wait(1000)
            .type(".mugine_class_1042",validResult);

        logger.info(`验证码${validResult}输入完毕`);
        yield nightmare.end();
        
    }catch (e){
        logger.error("出现错误:%s",e.stack);
    }
};

module.exports={
    /**
     * worker通过调用这个方法加载插件执行
     * @param activityId:活动id
     * @param phoneNumber:手机号
     * @param onFinish:结束的回调 fn(bool,result)
     */
    main:function (activityId,phoneNumber,fileDir,onFinish) {
        //use `co` to execute the generator function
        co.wrap(run)(activityId,phoneNumber,fileDir).then(function(result) {
            logger.info("插件运行结束，输出结果:"+result);
            onFinish && onFinish(true,result);
        }, function(err) {
            logger.error(err.stack);
            onFinish && onFinish(false,err);
        });
    }
}






