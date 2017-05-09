#!/usr/bin/env bash

echo "准备启动 调度服务:"
echo "call this bash file in src dir,use command: ./run/scheduler.sh"

export NODE_DEBUG=debug,info,error

#node ./scheduler/main.js ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9}
pm2 start "./scheduler/main.js" --name scheduler --no-autorestart