#!/usr/bin/env bash

echo "准备启动 调度服务:"
echo "call this bash file with activity No,for example: ./scheduler.sh 12345 01 13865803583"

export NODE_DEBUG=debug,info,error

node ../scheduler/main.js ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9}