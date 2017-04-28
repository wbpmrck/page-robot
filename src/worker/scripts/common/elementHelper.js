/** 用于对html里的元素进行操作和信息获取
 * Created by kaicui on 17/4/25.
 */
window.__nightmare = {};
__nightmare.ipc = require('electron').ipcRenderer;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

window.ElementHelper={
    //获取指定元素的位置信息
    getPosition: function (ele) {
        
        var clientRect = ele.getBoundingClientRect(); //{top: 102, right: 694, bottom: 3878, left: 74, width: 620}
        
        var r = {
            top: clientRect.top,
            right: clientRect.right,
            bottom: clientRect.bottom,
            left: clientRect.left,
            width: clientRect.width
        }
        r.height = r.bottom - r.top; //add height
        r.realTop = r.top + document.documentElement.scrollTop;
        r.realBottom = r.top + document.documentElement.scrollTop;
        r.realLeft = r.left + document.documentElement.scrollLeft;
        r.realRight = r.right + document.documentElement.scrollLeft;
        
        // console.log("prepare return pos:"+JSON.stringify(r));
        return r;
    },
    keydown : function(k) {
        var oEvent = document.createEvent('KeyboardEvent');
        
        // Chromium Hack
        Object.defineProperty(oEvent, 'keyCode', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        Object.defineProperty(oEvent, 'which', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        
        if (oEvent.initKeyboardEvent) {
            oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, k, k);
        } else {
            oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, k, 0);
        }
        
        oEvent.keyCodeVal = k;
        
        if (oEvent.keyCode !== k) {
            alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
        }
        
        document.dispatchEvent(oEvent);
    },
    
    keypress : function(k) {
        var oEvent = document.createEvent('KeyboardEvent');
        
        // Chromium Hack
        Object.defineProperty(oEvent, 'keyCode', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        Object.defineProperty(oEvent, 'which', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        
        if (oEvent.initKeyboardEvent) {
            oEvent.initKeyboardEvent("keypress", true, true, document.defaultView, false, false, false, false, k, k);
        } else {
            oEvent.initKeyEvent("keypress", true, true, document.defaultView, false, false, false, false, k, 0);
        }
        
        oEvent.keyCodeVal = k;
        
        if (oEvent.keyCode !== k) {
            alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
        }
        
        document.dispatchEvent(oEvent);
    },
    keyup : function(k) {
        var oEvent = document.createEvent('KeyboardEvent');
        
        // Chromium Hack
        Object.defineProperty(oEvent, 'keyCode', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        Object.defineProperty(oEvent, 'which', {
            get : function() {
                return this.keyCodeVal;
            }
        });
        
        if (oEvent.initKeyboardEvent) {
            oEvent.initKeyboardEvent("keyup", true, true, document.defaultView, false, false, false, false, k, k);
        } else {
            oEvent.initKeyEvent("keyup", true, true, document.defaultView, false, false, false, false, k, 0);
        }
        
        oEvent.keyCodeVal = k;
        
        if (oEvent.keyCode !== k) {
            alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
        }
        
        document.dispatchEvent(oEvent);
    }
}


