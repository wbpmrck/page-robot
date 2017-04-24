#!/usr/bin/env bash

echo "call this bash file with activity No,for example: ./worker-alone.sh 01"

export NODE_DEBUG=debug,info,error

node ../worker/main.js ${1}