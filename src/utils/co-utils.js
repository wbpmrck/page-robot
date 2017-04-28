/** add util to run co.js
 * Created by kaicui on 17/4/27.
 */
module.exports={
    /**
     * 返回promise,用于结合co库，进行sleep操作
     * @param ms
     */
    sleep:function (ms) {
        return new Promise(function (resolve, reject) {
           setTimeout(function () {
               resolve();
           },ms)
        });
    }
}
