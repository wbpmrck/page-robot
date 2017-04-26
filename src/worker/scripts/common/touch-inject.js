window.__nightmare = {};
__nightmare.ipc = require('electron').ipcRenderer;

window._showEvt = function (evt,when) {
    if(evt.type!=="mousemove" && evt.type!=="touchmove"){
        console.log(`
        [${when}]:
    type:${evt.type},
    ts:${evt.timeStamp},
    target:${evt.target},
    targetId:${my.locateDOM(evt.target)},
    currentTarget:${my.locateDOM(evt.currentTarget)},
    originalTarget:${my.locateDOM(evt.originalTarget)},
    bubbles :${evt.bubbles },
    which:${evt.which},
    isTrusted:${evt.isTrusted},
    altKey:${evt.altKey},
    ctrlKey:${evt.ctrlKey},
    metaKey:${evt.metaKey},
    shiftKey:${evt.shiftKey},
                
    pageX:${evt.pageX},
    pageY:${evt.pageY},
    screenX:${evt.screenX},
    screenY:${evt.screenY},
    clientX:${evt.clientX},
    clientY:${evt.clientY}
`)
    }
};

(function(window, document, exportName, undefined) {
    "use strict";
    
    // alert("123")
    
    var isMultiTouch = false;
    var multiTouchStartPos;
    var eventTarget;
    var touchElements = {};
    
    // polyfills
    if(!document.createTouch) {
        document.createTouch = function(view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
            // auto set
            if(clientX == undefined || clientY == undefined) {
                clientX = pageX - window.pageXOffset;
                clientY = pageY - window.pageYOffset;
            }
            
            return new Touch(target, identifier, {
                pageX: pageX,
                pageY: pageY,
                screenX: screenX,
                screenY: screenY,
                clientX: clientX,
                clientY: clientY
            });
        };
    }
    
    if(!document.createTouchList) {
        document.createTouchList = function() {
            var touchList = new TouchList();
            for (var i = 0; i < arguments.length; i++) {
                touchList[i] = arguments[i];
            }
            touchList.length = arguments.length;
            return touchList;
        };
    }
    
    /**
     * create an touch point
     * @constructor
     * @param target
     * @param identifier
     * @param pos
     * @param deltaX
     * @param deltaY
     * @returns {Object} touchPoint
     */
    function Touch(target, identifier, pos, deltaX, deltaY) {
        deltaX = deltaX || 0;
        deltaY = deltaY || 0;
        
        this.identifier = identifier;
        this.target = target;
        this.clientX = pos.clientX + deltaX;
        this.clientY = pos.clientY + deltaY;
        this.screenX = pos.screenX + deltaX;
        this.screenY = pos.screenY + deltaY;
        this.pageX = pos.pageX + deltaX;
        this.pageY = pos.pageY + deltaY;
    }
    
    /**
     * create empty touchlist with the methods
     * @constructor
     * @returns touchList
     */
    function TouchList() {
        var touchList = [];
        
        touchList.item = function(index) {
            return this[index] || null;
        };
        
        // specified by Mozilla
        touchList.identifiedTouch = function(id) {
            return this[id + 1] || null;
        };
        
        return touchList;
    }
    
    
    /**
     * Simple trick to fake touch event support
     * this is enough for most libraries like Modernizr and Hammer
     */
    function fakeTouchSupport() {
        var objs = [window, document.documentElement];
        var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];
        
        for(var o=0; o<objs.length; o++) {
            for(var p=0; p<props.length; p++) {
                if(objs[o] && objs[o][props[p]] == undefined) {
                    objs[o][props[p]] = null;
                }
            }
        }
    }
    
    /**
     * we don't have to emulate on a touch device
     * @returns {boolean}
     */
    function hasTouchSupport() {
        return ("ontouchstart" in window) || // touch events
            (window.Modernizr && window.Modernizr.touch) || // modernizr
            (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
    }
    
    /**
     * disable mouseevents on the page
     * @param ev
     */
    function preventMouseEvents(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }
    
    /**
     * only trigger touches when the left mousebutton has been pressed
     * @param touchType
     * @returns {Function}
     */
    function onMouse(touchType) {
        return function(ev) {
            // console.log("onMouse["+touchType+"]");
            _showEvt(ev,"onMouse["+touchType+"]");
            // prevent mouse events
            preventMouseEvents(ev);
            
            // if (ev.which !== 1) {
            //     console.log("which != 1");
            //     return;
            // }
            
            // The EventTarget on which the touch point started when it was first placed on the surface,
            // even if the touch point has since moved outside the interactive area of that element.
            // also, when the target doesnt exist anymore, we update it
            if (ev.type == 'mousedown' || !eventTarget || (eventTarget && !eventTarget.dispatchEvent)) {
                eventTarget = ev.target;
            }
            
            // shiftKey has been lost, so trigger a touchend
            if (isMultiTouch && !ev.shiftKey) {
                triggerTouch('touchend', ev);
                isMultiTouch = false;
            }
            //todo:不能无脑触发touchmove,应该确保touches>0的情况才触发
            if(ev.touches && ev.touches.length>0){
                triggerTouch(touchType, ev);
            }
            
            
            // we're entering the multi-touch mode!
            if (!isMultiTouch && ev.shiftKey) {
                isMultiTouch = true;
                multiTouchStartPos = {
                    pageX: ev.pageX,
                    pageY: ev.pageY,
                    clientX: ev.clientX,
                    clientY: ev.clientY,
                    screenX: ev.screenX,
                    screenY: ev.screenY
                };
                triggerTouch('touchstart', ev);
            }
            
            // reset
            if (ev.type == 'mouseup') {
                multiTouchStartPos = null;
                isMultiTouch = false;
                eventTarget = null;
            }
        }
    }
    
    /**
     * trigger a touch event
     * @param eventName
     * @param mouseEv
     */
    function triggerTouch(eventName, mouseEv) {
        var touchEvent = document.createEvent('Event');
        touchEvent.initEvent(eventName, true, true);
        
        touchEvent.altKey = mouseEv.altKey;
        touchEvent.ctrlKey = mouseEv.ctrlKey;
        touchEvent.metaKey = mouseEv.metaKey;
        touchEvent.shiftKey = mouseEv.shiftKey;

        touchEvent.touches = getActiveTouches(mouseEv, eventName);
        touchEvent.targetTouches = getActiveTouches(mouseEv, eventName);
        touchEvent.changedTouches = getChangedTouches(mouseEv, eventName);
        
        // console.log("trigger touch:"+eventName);
        // console.log("trigger touch:"+eventName+",data="+JSON.stringify(touchEvent));
        eventTarget.dispatchEvent(touchEvent);
        _showEvt(touchEvent,"trigger touch:"+eventName);
    }
    
    /**
     * create a touchList based on the mouse event
     * @param mouseEv
     * @returns {TouchList}
     */
    function createTouchList(mouseEv) {
        var touchList = new TouchList();
        
        if (isMultiTouch) {
            var f = TouchEmulator.multiTouchOffset;
            var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
            var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;
            
            touchList.push(new Touch(eventTarget, 1, multiTouchStartPos, (deltaX*-1) - f, (deltaY*-1) + f));
            touchList.push(new Touch(eventTarget, 2, multiTouchStartPos, deltaX+f, deltaY-f));
        } else {
            touchList.push(new Touch(eventTarget, 1, mouseEv, 0, 0));
        }
        
        return touchList;
    }
    
    /**
     * receive all active touches
     * @param mouseEv
     * @returns {TouchList}
     */
    function getActiveTouches(mouseEv, eventName) {
        // empty list
        if (mouseEv.type == 'mouseup') {
            return new TouchList();
        }
        
        var touchList = createTouchList(mouseEv);
        if(isMultiTouch && mouseEv.type != 'mouseup' && eventName == 'touchend') {
            touchList.splice(1, 1);
        }
        return touchList;
    }
    
    /**
     * receive a filtered set of touches with only the changed pointers
     * @param mouseEv
     * @param eventName
     * @returns {TouchList}
     */
    function getChangedTouches(mouseEv, eventName) {
        var touchList = createTouchList(mouseEv);
        
        // we only want to return the added/removed item on multitouch
        // which is the second pointer, so remove the first pointer from the touchList
        //
        // but when the mouseEv.type is mouseup, we want to send all touches because then
        // no new input will be possible
        if(isMultiTouch && mouseEv.type != 'mouseup' &&
            (eventName == 'touchstart' || eventName == 'touchend')) {
            touchList.splice(0, 1);
        }
        
        return touchList;
    }
    
    /**
     * show the touchpoints on the screen
     */
    function showTouches(ev) {
        var touch, i, el, styles;
        
        // first all visible touches
        for(i = 0; i < ev.touches.length; i++) {
            touch = ev.touches[i];
            el = touchElements[touch.identifier];
            if(!el) {
                el = touchElements[touch.identifier] = document.createElement("div");
                document.body.appendChild(el);
            }
            
            styles = TouchEmulator.template(touch);
            for(var prop in styles) {
                el.style[prop] = styles[prop];
            }
        }
        
        // remove all ended touches
        if(ev.type == 'touchend' || ev.type == 'touchcancel') {
            for(i = 0; i < ev.changedTouches.length; i++) {
                touch = ev.changedTouches[i];
                el = touchElements[touch.identifier];
                if(el) {
                    el.parentNode.removeChild(el);
                    delete touchElements[touch.identifier];
                }
            }
        }
    }
    
    /**
     * TouchEmulator initializer
     */
    function TouchEmulator() {
        //disable by kaicui
        // if (hasTouchSupport()) {
        //     return;
        // }
        //
        // fakeTouchSupport();
        
        window.addEventListener("mousedown", onMouse('touchstart'), true);
        window.addEventListener("mousemove", onMouse('touchmove'), true);
        window.addEventListener("mouseup", onMouse('touchend'), true);
        
        window.addEventListener("mouseenter", preventMouseEvents, true);
        window.addEventListener("mouseleave", preventMouseEvents, true);
        window.addEventListener("mouseout", preventMouseEvents, true);
        window.addEventListener("mouseover", preventMouseEvents, true);
        
        // it uses itself! to show the dot when mouse move
        //2017年04月26日删除，用于检查到底哪里问题
        // window.addEventListener("touchstart", showTouches, false);
        // window.addEventListener("touchmove", showTouches, false);
        // window.addEventListener("touchend", showTouches, false);
        // window.addEventListener("touchcancel", showTouches, false);
    }
    
    // start distance when entering the multitouch mode
    TouchEmulator.multiTouchOffset = 75;
    
    /**
     * css template for the touch rendering
     * @param touch
     * @returns object
     */
    TouchEmulator.template = function(touch) {
        var size = 30;
        var transform = 'translate('+ (touch.clientX-(size/2)) +'px, '+ (touch.clientY-(size/2)) +'px)';
        return {
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#fff',
            border: 'solid 1px #999',
            opacity: .6,
            borderRadius: '100%',
            height: size + 'px',
            width: size + 'px',
            padding: 0,
            margin: 0,
            display: 'block',
            overflow: 'hidden',
            pointerEvents: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            userSelect: 'none',
            webkitTransform: transform,
            mozTransform: transform,
            transform: transform
        }
    };
    
    // // export
    // if (typeof define == "function" && define.amd) {
    //     define(function() {
    //         return TouchEmulator;
    //     });
    // } else if (typeof module != "undefined" && module.exports) {
    //     module.exports = TouchEmulator;
    // } else {
        window[exportName] = TouchEmulator;
    // }
})(window, document, "TouchEmulator");

TouchEmulator();


window.ElementHelper={
    //获取指定元素的位置信息
    getPosition:function (ele) {
        
        var clientRect = ele.getBoundingClientRect(); //{top: 102, right: 694, bottom: 3878, left: 74, width: 620}
        
        var r = {
            top:clientRect.top,
            right:clientRect.right,
            bottom:clientRect.bottom,
            left:clientRect.left,
            width:clientRect.width
        }
        r.height = r.bottom - r.top; //add height
        r.realTop = r.top+document.documentElement.scrollTop;
        r.realBottom = r.top+document.documentElement.scrollTop;
        r.realLeft = r.left+document.documentElement.scrollLeft;
        r.realRight = r.right+document.documentElement.scrollLeft;
        
        // console.log("prepare return pos:"+JSON.stringify(r));
        return r;
    }
}

window.my={};
my.locateDOM = function (dom) {
    var l="",
        pl;
    if(dom){
        if(dom.getAttribute){
            l =dom.getAttribute("id");
            //如果dom没有定义id，则尝试从父元素来定位它自己
            if(l===null){
                //先获取父元素的定位信息
                pl = my.locateDOM(dom.parentNode);
                //再获取自己在父元素的同类子元素中，是第几个
                var sibling = dom.previousSibling,
                    count=0;
                //遍历所有在前面的“元素”类兄弟
                while (true) {
                    if(sibling){
                        if(sibling.nodeType===1 && sibling.tagName.toLowerCase() === dom.tagName.toLowerCase()){
                            //如果是元素类节点，且元素名和dom一样
                            count++;
                        }
                        sibling = sibling.previousSibling;
                    }else{
                        //没有前面的兄弟了，查找结束
                        break;
                    }
                }
                l=[pl,'>',dom.tagName.toLowerCase(),'[',count,']'].join('')
            }else{
                //如果有id,则用#表示id
                l="#"+l;
            }
        }else{
            l = dom.nodeName
        }
    }
    return l;
}