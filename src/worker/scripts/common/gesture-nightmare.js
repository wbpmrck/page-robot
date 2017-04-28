/** 扩充nightmare 内置的手势
 *
 * 1.本手势库使用了./elementHelper作为浏览器前置脚本
 * 2.本手势库需要页面里面有jquery/zepto.js. 如果没有，需要另外自行加载
 * Created by kaicui on 17/4/25.
 */
var Nightmare = require('nightmare');


//提供触屏端的tap事件(通过模拟mouse事件+浏览器内置的脚本:"phantom-limb"来实现)
Nightmare.action('tap', function (selector,done) {
    // console.log("tap begin");
    this.evaluate_now(function (selector) {
        
        var element = $(selector)[0];
        if (!element) {
            throw new Error('Unable to find element by selector: ' + selector);
        }
        var event = undefined;
        //获取元素的位置
        var pos=ElementHelper.getPosition(element);
        
        var event = document.createEvent('Event');
        event.initEvent("mousemove", true, true);
    
        //取元素的中心点
        event.clientX = parseInt( (pos.left + pos.right) /2 );
        event.clientY = parseInt( (pos.top + pos.bottom) /2 );
        event.screenX = event.screenX+1; //模拟浏览器边框的粗 1px
        event.screenY = event.screenY+110; //模拟浏览器标题栏 110px
        event.pageX = parseInt( (pos.realLeft + pos.realRight) /2 );
        event.pageY = parseInt( (pos.realTop + pos.realBottom) /2 );
        
        event.which = 1;
        
        // console.log("prepare dispatch click->0:mousemove")
        element.dispatchEvent(event);
    
        setTimeout(()=>{
    
            var event2 = document.createEvent('Event');
            event2.initEvent("mousedown", true, true);
    
            //取元素的中心点
            event2.clientX = parseInt( (pos.left + pos.right) /2 );
            event2.clientY = parseInt( (pos.top + pos.bottom) /2 );
            event2.screenX = event2.screenX+1; //模拟浏览器边框的粗 1px
            event2.screenY = event2.screenY+110; //模拟浏览器标题栏 110px
            event2.pageX = parseInt( (pos.realLeft + pos.realRight) /2 );
            event2.pageY = parseInt( (pos.realTop + pos.realBottom) /2 );
    
            event2.which = 1;
    
            // console.log("prepare dispatch click->1:mousedown")
            element.dispatchEvent(event2);
        },10);
    
    
        setTimeout(()=>{
        
            var event3 = document.createEvent('Event');
            event3.initEvent("mouseup", true, true);
        
            //取元素的中心点
            event3.clientX = parseInt( (pos.left + pos.right) /2 );
            event3.clientY = parseInt( (pos.top + pos.bottom) /2 );
            event3.screenX = event3.screenX+1; //模拟浏览器边框的粗 1px
            event3.screenY = event3.screenY+110; //模拟浏览器标题栏 110px
            event3.pageX = parseInt( (pos.realLeft + pos.realRight) /2 );
            event3.pageY = parseInt( (pos.realTop + pos.realBottom) /2 );
        
            event3.which = 1;
        
            // console.log("prepare dispatch click->2:mouseup")
            element.dispatchEvent(event3);
        
        },40);
    }, done, selector);
});
Nightmare.action('focus', function (selector,done) {
    this.evaluate_now(function (selector) {
        var element = document.querySelector(selector);
        if(element) {
            element.focus()
        }
    }, done, selector);
});
Nightmare.action('blur', function (selector,done) {
    this.evaluate_now(function (selector) {
        var element = document.querySelector(selector);
        if(element) {
            element.blur()
        }
    }, done, selector);
});

//模拟键盘按下
Nightmare.action('keydown', function (keyCode,done) {
    this.evaluate_now(function (keyCode) {
        ElementHelper.keydown(keyCode);
    }, done, keyCode);
});
//模拟键盘整个按下、弹起过程
Nightmare.action('keypress', function (keyCode,done) {
    this.evaluate_now(function (keyCode) {
        ElementHelper.keydown(keyCode);
        setTimeout(function () {
            ElementHelper.keypress(keyCode);
        },100);
        setTimeout(function () {
            ElementHelper.keyup(keyCode);
        },200);
    }, done, keyCode);
});
//模拟键盘弹起
Nightmare.action('keyup', function (keyCode,done) {
    this.evaluate_now(function (keyCode) {
        ElementHelper.keyup(keyCode);
    }, done, keyCode);
});

//获取某个元素的位置信息: {x,y,width,height}
Nightmare.action('getRect', function (selector,done) {
    this.evaluate_now(function(selector) {
    
        var element = $(selector)[0];
        if (!element) {
            throw new Error('Unable to find element by selector: ' + selector);
        }
        var clientRect = element.getBoundingClientRect();
        
        return {
            x:parseInt(clientRect.left),
            y:parseInt(clientRect.top),
            height:parseInt(clientRect.height),
            width:parseInt(clientRect.width)
        }
    }, done,selector)
})