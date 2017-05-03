# page-robot
one page automation framework,base on Phantomjs.

# how to install


# how to run

goto `./run` directory,and execute


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