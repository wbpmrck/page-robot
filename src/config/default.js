/** 配置
 * Created by kaicui on 17/4/22.
 */

module.exports ={
    worker:{
      wsTimeout:30 //worker调用websocket通知scheduler的时候，如果ws链接断开，重发的等待时间(单位s)
    },
    scheduler:{
        domainPrefix:"", //动态网站部署的一级目录名，为""表示端口根目录
        port:1234,//监听的http端口，通过此端口可以接受对外服务
        auth:{
          userName:"ifly-flow-scheduler",//http 所有请求头需要带上这个才可以受理
          userNameHeaderName:"ifly-auth" //http 鉴权请求头名称
        },
        ws:{
          port:4567 //websocket服务端口
        },
        template: {
            path: 'views',
            options: {
                // map: { ect: 'ect' }
                map: { html: 'ect' }
            }
        },
        session: {
            key: 'koa:sess2', /** (string) cookie key (default is koa:sess) */
            maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
            overwrite: true, /** (boolean) can overwrite or not (default true) */
            httpOnly: true, /** (boolean) httpOnly or not (default true) */
            signed: false, /** (boolean) signed or not (default true) */
        }
    }
}