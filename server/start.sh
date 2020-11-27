#!/bin/bash

docker build --no-cache -t web-audio-injector-server . 

docker run \
    -it \
    -p 3000:3000 \
    -p 3001:3001 \
    --rm \
    web-audio-injector-server
