# TODO

- worker 开发
    - 使用pm2 直接启动worker的plugin脚本

    > 使用worker通过child_process启动phantomjs的方式，暂时不使用了
- plugin 开发
    - 使用 国务院 活动作为第一个插件开发案例
- scheduler 开发
    - 调度器具体职责待定


# 难点解决

- 模拟touch事件
    - 部分使用第三方H5框架生成的页面，单纯的在元素上模拟touchstart等事件是不够的，他可能
    是获取了touch事件里的坐标等参数。
    - 需要模拟非常真实的touch事件参数，传递给DOM
    - isTrusted标记，是只读的，标识了该事件是用户行为触发的还是程序生成的，这个暂时没有
    什么好办法，只能祈祷第三方页面没有做这方面检查