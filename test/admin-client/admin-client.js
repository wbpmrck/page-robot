/**
 * Created by kaicui on 17/5/9.
 */

var config  = require("../../src/config/default");
var socket = require('socket.io-client')(`http://localhost:${config.scheduler.ws.port}`);

var codes =[];

function appendCodes(vcodes) {
    codes = codes.concat(vcodes);
    // console.log("all codes="+JSON.stringify(codes));
}

socket.on('connect', function(){
    console.log("connected");
    socket.emit("reg",undefined,"admin",function (vcodes){
        //往全局viewModel.codes里面Push
        appendCodes(vcodes);
    });
    socket.on("vCodePush",function(vcodes){
        //往全局viewModel.codes里面Push
        appendCodes(vcodes);
    })
    
});
// socket.on('event', function(data){});
socket.on('disconnect', function(){
    console.log("disconnect");
});

setInterval(function () {
    // console.log("准备检查是否有可模拟回复的验证码");
    if(codes.length>0){
        //当打码员输入验证码，点击提交按钮的时候
        let answer = parseInt(Math.random()*10000);
        console.log(`准备回复答案=${answer}`);
        socket.emit("vCodeSubmit",codes[0].id,answer,function (ok){
            console.log(`收到scheduler对id=${codes[0].id}的回复:${ok}`);
            if(ok){
                codes.splice(0,1)
            }
        });
    }
},4000);