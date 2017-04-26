/** worker 的启动入口2
 * 使用nightmare作为驱动
 * Created by kaicui on 17/4/22.
 */

const logger = require('../../../../log/logger');
var Nightmare = require('nightmare');
var _ = require("../../common/gesture-nightmare");
var path = require("path");
var nightmare = Nightmare({
    show: true ,
    webPreferences: {
        preload: path.resolve("../../common/elementHelper.js")
        // preload: path.resolve("../../common/touch-inject.js")
        // preload: path.resolve("../../common/phantom-limb.js")
        //alternative: preload: "absolute/path/to/custom-script.js"
    }
});



logger.info("启动 国务院活动插件");

/* ---------------------------------
 错误处理
 ---------------------------------*/
process.on('uncaughtException', (err) => {
    console.error(`worker Caught exception: ${err}`);
});

process.on('SIGHUP', () => {
    console.log('worker Received SIGHUP.');
});

process.on('exit', (code) => {
    console.log(`worker About to exit with code: ${code}`);
});

/*  --------------------------
        开始运行机器人
    --------------------------
 */

var entryPageUrl = "http://app.www.gov.cn/govdata/html5/2017cyc/?_source=govapp";
var ua = "Mozilla/5.0 (Linux; Android 7.0; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36 GovCnAndroid(huawei;8)";

var instance = nightmare
    .useragent(ua)
    // .goto('http://h5video.adsring.cn/home/index/?_c=H5_jd&_p=prod_h5#/shop')
    .goto(entryPageUrl)
    ;


instance
    .wait('.mugine_class_981')
    .inject("js",path.resolve("../../common/phantom-limb.js"))
    .wait(3000)
    // .evaluate(function () {
    //     let dom= $('.mugine_class_981 .curve_render path')[0];
    //     dom.addEventListener("touchstart",function (evt) {
    //         console.log("haha,i got:touchstart \r\n ----------- \r\n");
    //         // _showEvt(evt,"haha");
    //     });
    //     dom.addEventListener("touchend",function (evt) {
    //         console.log("haha,i got:touchend \r\n ----------- \r\n");
    //         // _showEvt(evt,"haha");
    //     })
    // })
    .tap('.mugine_class_981 .curve_render path') //开始答题
   
    .wait(3000)
    .wait('.mugine_class_985')
    .tap(".mugine_class_985") //点击关闭提示
    .wait('.mugine_class_989') //看到"政府报告知多少"
    
    //获取第一题题干
    .evaluate(function () {
        let dom= $('.mugeda_render_object.mugine_class_82.mugine_class_83 div')[0];
        return dom.innerText;
    });



//开始执行：then内部会调用nightmare.run 运行 queue 的任务
instance.then(function (result) {
        console.log(`result is:${result}`);

        // console.log("prepare to end...")
        // instance.end(() => "plugin process end...")
        //     .then((value) => console.log(value));
    })
    .catch(function (error) {
        console.error('entry.js: failed:', error);
    });

