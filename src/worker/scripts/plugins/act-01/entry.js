/** worker 的启动入口2
 * 使用nightmare作为驱动
 * Created by kaicui on 17/4/22.
 */

const logger = require('../../../../log/logger');
var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })


logger.info("启动 worker");



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


var instance = nightmare
    .goto('https://www.baidu.com/');
instance.type('#kw', '崔凯')
    .type('body', '\u000d')
    .wait('.result')
    .evaluate(function () {
        let dom= document.getElementsByClassName('result')[0];
        return dom.innerHTML;
    })
    // .end()
    .then(function (result) {
        console.log(result)
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });

setTimeout(()=>{
    console.log("prepare to end...")
    instance.end(() => "plugin process end...")
    //prints "some value"
        .then((value) => console.log(value));
},3000)

