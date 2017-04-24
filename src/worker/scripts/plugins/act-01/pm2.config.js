module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
        name      : "01-国务院活动",
        script    : "./entry.js",
        env: {
            NODE_DEBUG: "debug,info,error", //开发环境展示所有日志
            // NODE_ENV: "debug,info,error", //the same as NODE_DEBUG
            var2: "2",
        },
        env_production : {
            NODE_ENV: "info,error" //现网环境不展示debug
        },
        autorestart:false //此活动机器人不需要自动重启
    }
    // ,
    //
    // // Second application
    // {
    //   name      : "WEB",
    //   script    : "web.js"
    // }
  ]
}
