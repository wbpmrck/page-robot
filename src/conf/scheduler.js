/** 调度器 相关配置
 * Created by kaicui on 17/4/22.
 */

module.exports ={
    port:1234,//监听的http端口，通过此端口可以接受对外服务
    maxWorker:10 ,//一台机器最多同时启动的worker数量
}