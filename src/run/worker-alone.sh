#!/usr/bin/env bash

export NODE_DEBUG=debug,info,error

#pm2 start ../worker/main.js
node ../worker/main.js