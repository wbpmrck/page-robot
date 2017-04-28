# TODO

- 全局机器人监控
    - 使用pm2 的 process metrics 功能监控机器人内部的一些程序变量
    - 使用pm2 的 process action 功能 给机器人发送一些实用的命令
- nightmare 的扩展：
    - 增加action,用于获取图形验证码的答案,入参是图片数据，出参是答案文本

# Doing:

- scheduler:
    - 使用koa2+socket.io 搭建scheduler服务框架
    - 内存中保存子进程状态、以及待识别的验证码任务
    - 使用node的父子进程通信机制，与机器人进程通信
- 使用 国务院 活动作为第一个插件开发案例

- 图形验证码
    - 管理系统开发验证码录入页面
    - 将验证码截图，通过消息发送给调度

# Done:

- worker 开发
    - 使用pm2 直接启动worker的plugin脚本

    > 使用worker通过child_process启动phantomjs的方式，暂时不使用了
- 手机号通过进程参数传入
- 设置userAgent
- 完成国务院插件答题过程
- 搞定手机号填写


# 难点解决

 - 手势的模拟
 - type方法漏字问题
    - type是在frame 内部模拟按键，总是漏一个字
    - 解决：在type之前手动focus,然后等待1s
 - 题干的获取
    - 每道题是乱序的
    - 页面是第三方平台生成的，从id,class上完全看不出规律
    - 最后采用从固定位置获取dom元素来解决

- 模拟touch事件
    - 部分使用第三方H5框架生成的页面，单纯的在元素上模拟touchstart等事件是不够的，他可能
    是获取了touch事件里的坐标等参数。
    - 需要模拟非常真实的touch事件参数，传递给DOM
    - isTrusted标记，是只读的，标识了该事件是用户行为触发的还是程序生成的，这个暂时没有
    什么好办法，只能祈祷第三方页面没有做这方面检查