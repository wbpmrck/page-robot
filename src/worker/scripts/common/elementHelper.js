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
    }
}
