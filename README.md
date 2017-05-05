# page-robot
one page automation framework,base on [nightmare](http://nightmarejs.org/) and [Electron](http://electron.atom.io/).

# how to install

first have to install `pm2` globally:

```
$ npm install pm2 -g
```

the cd the project dir and execute:

```
$ npm install
```


# how to run

goto `./src` directory,and execute command:

```
$ ./run/scheduler.sh
```

so the scheduler has boot up,which will listen to port `1234` to server http request,and `4567` port to serve websocket request.

> you can change the port config in `./config/default.js`,the config data will like below:

 ```js


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

 ```

# program structure

* src/scheduler:
    * 调度程序，负责启动worker,并负责对外界的通信
        * controllers:
            * 放所有http的controller
        * framework:
            * scheduler的底层设施
        * interceptors:
            * 拦截器
        * routes:
            * 路由设置
        * store:
            * 存放scheduler内存中保存的信息，主要是worker的状态，还有等待处理的验证码信息
        * views:
            * scheduler作为web服务，也提供页面展示功能，html可以放在里面
* src/worker:
    * 工作程序，负责启动phantomjs进程，进行实际的工作
* src/worker/scripts/plugins:
    * 插件，当worker启动之后，需要根据当前的目标url不同，加载不同的插件进行逻辑处理
* src/utils:
    * 存放项目内通用的一些辅助类
* src/libs:
    * 存放第三方的一些通用库
* src/log:
    * 日志库，用于记录日志
* src/run:
    * 存放常用的各种启动脚本
* data[recordId]:
    * 每个活动参与记录下保存的临时文件信息


# docs
the framework use some 3rd-party library,and has encountered many problems of these libs.
so docs are needed.

 - nightmare-examples:

    > this directory container useful docs/demos for nightmare test framework.
 - http接口文档
    - [点击此处](./http.md)