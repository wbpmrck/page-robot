# page-robot
one page automation framework,base on Phantomjs.

# how to install


# how to run

goto `./run` directory,and execute


# program structure

* src/scheduler:
    * 调度程序，负责启动worker,并负责对外界的通信
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