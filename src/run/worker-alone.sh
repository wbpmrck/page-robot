#!/usr/bin/env bash

echo "准备直接启动worker:"
echo "call this bash file with activity No,for example: ./worker-alone.sh 12345 01 13865803583"

export NODE_DEBUG=debug,info,error

node ../worker/main.js ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9}